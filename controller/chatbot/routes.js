let requireDirectory = require("require-directory");
const controller = requireDirectory(module, "./");
const express = require("express");
const createDualJwtAuth = require("../middleware/tokenmiddleware");
const chatRoutes = express.Router();
const ticketController = require("./updateTicketTag");
const { deleteChatMessage, editChatMessage } = require("./editDelete");

chatRoutes.use(createDualJwtAuth(["admin", "seller"]));
chatRoutes.get("/chats", controller.chatList);
chatRoutes.get("/chat/:orderId", controller.detail);

chatRoutes.post(
    "/chatbot/update-chat-progress",
    controller.updateChatProgress
);
chatRoutes.post("/chatbot/note", controller.createNote);

chatRoutes.get("/chatbot/ticket-tags", ticketController.getTagOptions);
chatRoutes.get(
    "/chatbot/ticket-with-tag-options",
    ticketController.getTicketWithTagOptions
);
chatRoutes.get("/chatbot/tickets-by-tag", ticketController.getTicketsByTag);
chatRoutes.post("/chatbot/ticket-tag", ticketController.updateTicketTag);
chatRoutes.get("/chatbot/listAll", controller.listAll);
chatRoutes.get("/chatbot/listTickets", controller.listTickets);
chatRoutes.get("/chatbot/viewTicket", controller.viewTicket);
chatRoutes.get("/chatbot/findByPhone", controller.viewTicketByPhone);
chatRoutes.post("/chatbot/resumeTicket", controller.resumeTicket);
chatRoutes.post("/chatbot/delete",deleteChatMessage)
chatRoutes.post("/chatbot/edit",editChatMessage)
chatRoutes.put("/chatbot/upload", controller.image);
chatRoutes.post("/chatbot/openNew", controller.openNew);
chatRoutes.post("/chatbot/resolveTicket", controller.resolveTicket);
chatRoutes.get("/tickets/graph-data", controller.getTicketGraphData);
chatRoutes.get("/tickets/graph-response", controller.getFirstResponseTime);
chatRoutes.get("/tickets/resolution", controller.getTicketGraphData11);
chatRoutes.get("/tickets/firstResponse", controller.getFirstResponseTime11);

module.exports = chatRoutes;
