/* eslint-disable no-unused-vars */
import {
    getBotResponses,
    getBotResponse,
    upsertFullResponse,
    createAndOverwriteResponses,
    createResponse,
    createResponses,
    deleteResponse,
    deleteVariation,
    getBotResponseById,
    upsertResponse,
    updateResponseType,
    langToLangResp,
} from '../mongo/botResponses';

const { PubSub, withFilter } = require('apollo-server-express');

const pubsub = new PubSub();
const RESPONSES_MODIFIED = 'RESPONSES_MODIFIED';
const RESPONSE_DELETED = 'RESPONSE_DELETED';

export default {
    Subscription: {
        botResponsesModified: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([RESPONSES_MODIFIED]),
                (payload, variables) => payload.projectId === variables.projectId,
            ),
        },
        botResponseDeleted: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([RESPONSE_DELETED]),
                (payload, variables) => payload.projectId === variables.projectId,
            ),
        },
    },
    Query: {
        async botResponses(_, args, __) {
            return getBotResponses(args.projectId);
        },
        async botResponse(_, args, __) {
            return getBotResponse(args.projectId, args.key);
        },
        async botResponseById(_, args, __) {
            return getBotResponseById(args._id);
        },
    },
    Mutation: {
        async deleteResponse(_, args, __) {
            const botResponseDeleted = await deleteResponse(args.projectId, args.key);
            pubsub.publish(RESPONSE_DELETED, {
                projectId: args.projectId,
                botResponseDeleted,
            });
            return { success: !!botResponseDeleted };
        },
        async upsertFullResponse(_, args, __) {
            const response = await upsertFullResponse(
                args.projectId,
                args._id,
                args.key,
                args.response,
            );
            const { _id } = response;
            pubsub.publish(RESPONSES_MODIFIED, {
                projectId: args.projectId,
                botResponsesModified: { ...args.response, _id },
            });
            return { success: response.ok === 1 };
        },
        createAndOverwriteResponses: async (_, { projectId: pid, responses }) => {
            const response = await createAndOverwriteResponses(pid, responses);
            response.forEach(({ projectId, ...botResponsesModified }) => pubsub.publish(
                RESPONSES_MODIFIED, { projectId, botResponsesModified },
            ));
            return response;
        },
        upsertResponse: async (_, args) => {
            // if the response type has been updated all the other languages and variations for this response
            // need to be updated so we use the updateResponseType function instead of upsertResponse
            const response = args.newResponseType ? await updateResponseType(args) : await upsertResponse(args);
            if (response) {
                const { projectId, ...botResponsesModified } = response;
                pubsub.publish(RESPONSES_MODIFIED, { projectId, botResponsesModified });
            } else {
                const { projectId, key } = args;
                const botResponsesModified = await getBotResponse(projectId, key);
                pubsub.publish(RESPONSES_MODIFIED, { projectId, botResponsesModified });
            }
            return response;
        },
        async createResponses(_, args, __) {
            const response = await createResponses(args.projectId, args.responses);
            return { success: !!response.id };
        },
        async deleteVariation(_, args, __) {
            const response = await deleteVariation(args);
            pubsub.publish(RESPONSES_MODIFIED, {
                projectId: args.projectId,
                botResponsesModified: response,
            });
            return { success: !!response };
        },
        async importRespFromLang(_, args, auth) {
            const response = await langToLangResp(args);
            pubsub.publish(RESPONSES_MODIFIED, {
                projectId: args.projectId,
                botResponsesModified: response,
            });
            return response;
        },
    },
    BotResponse: {
        key: (parent, _, __) => parent.key,
        _id: (parent, _, __) => parent._id,
        projectId: (parent, _, __) => parent.projectId,
        values: (parent, _, __) => parent.values,
    },
    BotResponseValue: {
        lang: (parent, _, __) => parent.lang,
        sequence: (parent, _, __) => parent.sequence,
    },
    ContentContainer: {
        content: (parent, _, __) => parent.content,
    },
};
