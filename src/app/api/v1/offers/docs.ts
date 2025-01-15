import { swaggerComponentRefs } from "@/lib/swagger/component";
import { swaggerSecurity } from "@/lib/swagger/security";

export const offersPaths = {
  "/api/v1/offers": {
    post: {
      tags: ["Offers"],
      security: swaggerSecurity,
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Title of the offer",
                },
                description: {
                  type: "string",
                  description: "Detailed description of the offer",
                },
                price: {
                  type: "number",
                  description: "Price for the offer",
                },
                type: {
                  type: "string",
                  description: "Type of the offer",
                },
                pickup_area: {
                  type: "string",
                  description: "Pickup area of the offer",
                },
                delivery_area: {
                  type: "string",
                  description: "Delivery area of the offer",
                },
                available_until: {
                  type: "string",
                  description: "Available until of the offer",
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
                  succes: {
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
    get: {
      tags: ["Offers"],
      security: swaggerSecurity,
      parameters: [
        {
          in: "query",
          name: "limit",
          schema: {
            type: "number",
          },
          required: false,
          default: 10,
        },
        {
          in: "query",
          name: "page",
          schema: {
            type: "number",
          },
          required: false,
          default: 1,
        },
      ],
      responses: {
        200: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  offers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        title: {
                          type: "string",
                        },
                        description: {
                          type: "string",
                        },
                        price: {
                          type: "number",
                        },
                        type: {
                          type: "string",
                        },
                        pickup_area: {
                          type: "string",
                        },
                        delivery_area: {
                          type: "string",
                        },
                        available_until: {
                          type: "string",
                        },
                        offer_status: {
                          type: "string",
                        },
                        created_at: {
                          type: "string",
                        },
                        updated_at: {
                          type: "string",
                        },
                        freelancer: {
                          type: "object",
                          properties: {
                            name: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                  page_info: {
                    $ref: swaggerComponentRefs.PageInfo,
                  },
                },
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
