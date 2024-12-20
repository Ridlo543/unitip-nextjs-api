import { swaggerComponentRefs } from "@/lib/swagger/component";
import { swaggerSecurity } from "@/lib/swagger/security";

export const applyJobByIdPaths = {
  "/api/v1/jobs/{job_id}/apply": {
    post: {
      tags: ["Jobs"],
      security: swaggerSecurity,
      parameters: [
        {
          in: "path",
          name: "job_id",
          schema: { type: "string" },
          required: true,
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                price: {
                  type: "number",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                  },
                  id: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        400: {
          content: {
            "application/json": {
              schema: {
                $ref: swaggerComponentRefs.BadRequestError,
              },
            },
          },
        },
        401: {
          content: {
            "application/json": {
              schema: {
                $ref: swaggerComponentRefs.UnauthorizedError,
              },
            },
          },
        },
        403: {
          content: {
            "application/json": {
              schema: {
                $ref: swaggerComponentRefs.ForbiddenError,
              },
            },
          },
        },
        500: {
          content: {
            "application/json": {
              schema: {
                $ref: swaggerComponentRefs.InternalServerError,
              },
            },
          },
        },
      },
    },
  },
};
