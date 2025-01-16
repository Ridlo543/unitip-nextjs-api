import { Order } from "@/constants/order";
import { Role } from "@/constants/role";
import { verifyBearerToken } from "@/lib/bearer-token";
import { database } from "@/lib/database";
import { APIResponse } from "@/lib/models/api-response";
import { sql } from "kysely";
import { NextRequest } from "next/server";
import { z } from "zod";

interface POSTResponse {
  success: boolean;
  id: string;
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const {
      title,
      description,
      type,
      available_until,
      price,
      pickup_area,
      delivery_area,
    } = json;

    const data = z
      .object({
        title: z
          .string({ required_error: "Judul tidak boleh kosong!" })
          .min(1, "Judul tidak boleh kosong!"),
        description: z
          .string({ required_error: "Deskripsi tidak boleh kosong!" })
          .min(1, "Deskripsi tidak boleh kosong!"),
        type: z.enum(["antar-jemput", "jasa-titip"]),
        available_until: z
          .string({
            required_error: "Waktu untuk penawaran tidak boleh kosong!",
          })
          .min(1, "Waktu untuk penawaran tidak boleh kosong!"),
        price: z
          .number({ required_error: "Biaya tidak boleh kosong!" })
          .min(0, "Biaya tidak boleh negatif!"),
        pickup_area: z.string().optional(),
        delivery_area: z.string().optional(),
      })
      .safeParse({
        title,
        description,
        type,
        available_until,
        price,
        pickup_area,
        delivery_area,
      });

    if (!data.success)
      return APIResponse.respondWithBadRequest(
        data.error.errors.map((it) => ({
          message: it.message,
          path: it.path[0] as string,
        }))
      );

    const authorization = await verifyBearerToken(request);
    if (!authorization) return APIResponse.respondWithUnauthorized();

    // validasi role
    if (authorization.role == "customer")
      return APIResponse.respondWithForbidden(
        "Anda tidak memiliki akses untuk membuat offer!"
      );
    console.log("Authorization:", authorization);

    if (type === "jasa-titip") {
      /**
       * jasa-titip adalah service single offer dan hanya dapat dibuat oleh role
       *selain customer
       */

      const query = database
        .insertInto("single_offers")
        .values({
          title,
          description,
          type,
          available_until,
          price,
          pickup_area,
          delivery_area,
          freelancer: authorization.userId,
          offer_status: "available",
          expired_at: null,
        } as any)
        .returning("id");

      console.log("Executing Query:", query.compile());

      const result = await query.executeTakeFirst();
      console.log("Query Result:", result);

      if (!result) return APIResponse.respondWithServerError();

      return APIResponse.respondWithSuccess<POSTResponse>({
        success: true,
        id: result.id,
      });
    } else if (type === "antar-jemput") {
      const query = database
        .insertInto("multi_offers")
        .values({
          title,
          description,
          price,
          available_until,
          freelancer: authorization.userId,
          status: "available",
          location: delivery_area,
        } as any)
        .returning("id");

      const result = await query.executeTakeFirst();
      if (!result) return APIResponse.respondWithServerError();

      return APIResponse.respondWithSuccess<POSTResponse>({
        success: true,
        id: result.id,
      });
    }
    return APIResponse.respondWithServerError();
  } catch (e) {
    return APIResponse.respondWithServerError();
  }
}

interface OfferFreelancer {
  name: string;
}
interface Offer {
  id: string;
  title: string;
  description: string;
  type: string;
  pickup_area: string;
  delivery_area: string;
  available_until: Date;
  price: number;
  freelancer: OfferFreelancer;
  created_at: string;
  updated_at: string;
}

interface GETResponse {
  offers: Offer[];
  page_info: {
    count: number;
    page: number;
    total_pages: number;
  };
}
interface OfferResult {
  id: string;
  title: string;
  description: string;
  type: string;
  available_until: Date;
  price: number;
  delivery_area?: string;
  pickup_area?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  freelancer_name: string;
}

export async function GET(request: NextRequest) {
  try {
    const authorization = await verifyBearerToken(request);
    if (!authorization) return APIResponse.respondWithUnauthorized();

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Number(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "all";

    if (!["all", "single", "multi"].includes(type)) {
      return APIResponse.respondWithBadRequest([
        {
          message: "Invalid type parameter",
          path: "type",
        },
      ]);
    }

    let offersResult: OfferResult[] = [];
    let totalCount = 0;

    if (type === "single" || type === "all") {
      const singleQuery = database
        .selectFrom("single_offers as so")
        .innerJoin("users as u", "u.id", "so.freelancer")
        .select([
          "so.id",
          "so.title",
          "so.description",
          "so.type",
          "so.available_until",
          "so.price",
          "so.delivery_area",
          "so.pickup_area",
          "u.name as freelancer_name",
          sql<string>`so."xata.createdAt"`.as("created_at"),
          sql<string>`so."xata.updatedAt"`.as("updated_at")
        ])
        // .where("so.offer_status", "=", "waiting");

      const singleCount = await database
        .selectFrom("single_offers")
        // .where("offer_status", "=", "waiting")
        .select(sql<number>`count(*)`.as("count"))
        .executeTakeFirst();

      if (type === "single") {
        offersResult = await singleQuery
          .orderBy(sql`so."xata.createdAt"`, "desc")
          .offset((page - 1) * limit)
          .limit(limit)
          .execute();
        totalCount = singleCount?.count || 0;
      } else {
        const singleOffers = await singleQuery.execute();
        offersResult = [...singleOffers];
        totalCount = singleCount?.count || 0;
      }
    }

    if (type === "multi" || type === "all") {
      const multiQuery = database
        .selectFrom("multi_offers as mo")
        .innerJoin("users as u", "u.id", "mo.freelancer")
        .select([
          "mo.id",
          "mo.title",
          "mo.description",
          sql<string>`'antar-jemput'`.as("type"),
          "mo.available_until",
          "mo.price",
          "mo.location as delivery_area",
          sql<string>`''`.as("pickup_area"),
          "u.name as freelancer_name",
          sql<string>`mo."xata.createdAt"`.as("created_at"),
          sql<string>`mo."xata.updatedAt"`.as("updated_at")
        ])
        // .where("mo.status", "=", "waiting");

      const multiCount = await database
        .selectFrom("multi_offers")
        // .where("status", "=", "waiting")
        .select(sql<number>`count(*)`.as("count"))
        .executeTakeFirst();

      if (type === "multi") {
        offersResult = await multiQuery
          .orderBy(sql`mo."xata.createdAt"`, "desc")
          .offset((page - 1) * limit)
          .limit(limit)
          .execute();
        totalCount = multiCount?.count || 0;
      } else if (type === "all") {
        const multiOffers = await multiQuery.execute();
        offersResult = [...offersResult, ...multiOffers];
        totalCount += multiCount?.count || 0;
      }
    }

    // For type "all", apply sorting and pagination after combining results
    if (type === "all") {
      offersResult.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      offersResult = offersResult.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit
      );
    }

    return APIResponse.respondWithSuccess<GETResponse>({
      offers: offersResult.map((it: OfferResult) => ({
        id: it.id,
        title: it.title || "",
        description: it.description || "",
        type: it.type || "jasa-titip",
        pickup_area: it.pickup_area || "",
        delivery_area: it.delivery_area || it.location || "",
        available_until: it.available_until ? new Date(it.available_until) : new Date(),
        price: Number(it.price) || 0,
        created_at: it.created_at || "",
        updated_at: it.updated_at || "",
        freelancer: {
          name: it.freelancer_name || "",
        },
      })),
      page_info: {
        count: offersResult.length,
        page: page,
        total_pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (e) {
    console.error("GET Error:", e);
    return APIResponse.respondWithServerError();
  }
}