import { authLoginPaths } from "@/app/api/v1/auth/login/docs";
import { authLogoutPaths } from "@/app/api/v1/auth/logout/docs";
import { authRegisterPaths } from "@/app/api/v1/auth/register/docs";
import { chatsPaths } from "@/app/api/v1/chats/docs";
import { chatMessagesFromUserIdPaths } from "@/app/api/v1/chats/messages/from/[user_id]/docs";
import { chatMessagesToUserIdPaths } from "@/app/api/v1/chats/messages/to/[user_id]/docs";
import { chatMessagesByRoomIdPaths } from "@/app/api/v1/chats/rooms/[room_id]/messages/docs";
import { chatRoomsPaths } from "@/app/api/v1/chats/rooms/docs";
import { examplePaths } from "@/app/api/v1/example/docs";
import { approveJobByIdPaths } from "@/app/api/v1/jobs/[job_id]/applicants/[applicant_id]/approve/docs";
import { applyJobByIdPaths } from "@/app/api/v1/jobs/[job_id]/apply/docs";
import { jobByIdPaths } from "@/app/api/v1/jobs/[job_id]/docs";
import { jobsPaths } from "@/app/api/v1/jobs/docs";
import { applyOfferByIdPaths } from "@/app/api/v1/offers/[offer_id]/apply/docs";
import { applyMultiOfferByIdPaths } from "@/app/api/v1/offers/[offer_id]/apply/multi/docs";
import { applySingleOfferByIdPaths } from "@/app/api/v1/offers/[offer_id]/apply/single/docs";
import { acceptanceOffersByIdPaths } from "@/app/api/v1/offers/[offer_id]/requests/[request_id]/acceptence/docs";
import { offersPaths } from "@/app/api/v1/offers/docs";
import { swaggerComponents } from "./component";
import { swaggerSecuritySchemes } from "./security";

export const swaggerSpec = {
  openapi: "3.1.0",
  info: { title: "Unitip API Documentation", version: "1.0" },
  components: {
    securitySchemes: swaggerSecuritySchemes,
    schemas: swaggerComponents,
  },
  paths: {
    // auth
    ...authLoginPaths,
    ...authLogoutPaths,
    ...authRegisterPaths,

    // jobs
    ...jobsPaths,
    ...jobByIdPaths,
    ...applyJobByIdPaths,
    ...approveJobByIdPaths,

    //offers
    ...offersPaths,
    ...applyOfferByIdPaths,
    ...applyMultiOfferByIdPaths,
    ...applySingleOfferByIdPaths,
    ...acceptanceOffersByIdPaths,

    // example
    ...examplePaths,

    // chats
    ...chatsPaths,
    ...chatRoomsPaths,
    ...chatMessagesByRoomIdPaths,
    ...chatMessagesFromUserIdPaths,
    ...chatMessagesToUserIdPaths,
  },
};
