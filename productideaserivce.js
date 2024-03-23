import assortmentHelper from '@/assortmentHelper/assortmentHelper';
import apiClient from "@/app/commons/api/client/apiClient.js";
import store from "@/app/commons/store/Store.js";
import statisticsService from '@/api/statisticsService/statisticsService';

export default {
    async getIdeasOfUser(options = {}, headers = {}) {
        const params = Object.assign(options, {
            localeMode: 'language',
        });

        const { data } = await apiClient.request({
            method: 'GET',
            url: `api/v1/users/${store.state.user.data.id}/ideas`,
            params,
            headers,
        });
        return data;
    },
    async getHasIntent() {
        return await apiClient.request({
            method: 'GET',
            url: `api/v1/users/${store.state.user.data.id}/ideas/publishingDetails/hasIntents`,
        });
    },
    async getIdeaOfUserById(ideaId) {
        const { data } = await apiClient.request({
            method: 'GET',
            url: `api/v1/users/${store.state.user.data.id}/ideas/${ideaId}`,
            params: {
                localeMode: 'language',
            },
        });
        return data;
    },
    async updateIdea(idea, options = {}) {
        const params = Object.assign(options, {
            localeMode: 'language',
        });

        const { data } = await apiClient.request({
            method: 'PUT',
            url: `api/v1/users/${store.state.user.data.id}/ideas/${idea.id}`,
            params: Object.assign({}, params, { localeMode: 'language' }),
            data: idea,
        });
        try {
            statisticsService.updateIdeaInFusion([idea.id]);
        } catch (error) {
            console.error('fusion update failed');
        }

        return data;
    },
    async getAssortment(idea, params) {
        const res = await apiClient.request({
            method: 'GET',
            url: `api/v1/users/${store.state.user.data.id}/ideas/${idea.id}/assortment`,
            params: {
                includeProductTypesWithoutSellables: true,
                ...params,
            },
        });
        return res.data;
    },
    async updateAssortment(idea) {
        // TODO: refactor, do not change idea at this point
        assortmentHelper.makeSelectedStatesConsistent(idea.assortment);

        await apiClient.request({
            method: 'PUT',
            url: `api/v1/users/${store.state.user.data.id}/ideas/${idea.id}/assortment`,
            data: idea.assortment,
        });
    },
    async getProductForSellable(idea, sellableId, params) {
        const res = await apiClient.request({
            method: 'GET',
            url: `api/v1/users/${store.state.user.data.id}/ideas/${idea.id}/assortment/sellables/${sellableId}/template`,
            params,
        });
        return res.data;
    },
    async updateProductForSellable(idea, sellableId, product) {
        await apiClient.request({
            method: 'PUT',
            url: `api/v1/users/${store.state.user.data.id}/ideas/${idea.id}/assortment/sellables/${sellableId}/template`,
            data: product,
        });
    },
    async deleteIdeas(ideas) {
        const requests = ideas.map(function (idea) {
            return apiClient.request({
                method: 'DELETE',
                url: `api/v1/users/${store.state.user.data.id}/ideas/${idea.id}`,
            });
        });
        const res = await Promise.all(requests);
        try {
            statisticsService.updateIdeaInFusion(ideas.map((idea) => idea.id));
        } catch (error) {
            console.error('fusion update failed');
        }
        return res;
    },
    async getPointsOfSale(idea) {
        const { data } = await apiClient.request({
            method: 'GET',
            url: `api/v1/users/${store.state.user.data.id}/ideas/${idea.id}/pointsOfSale`,
        });
        return data.list;
    },
    async getIdeasOfPointOfSale(posTargetId, options = {}) {
        const params = Object.assign(options, {
            locale: null,
        });

        const { id } = store.state.user.pointsOfSale.find(
            (p) => p.target.id === posTargetId
        );
        const { data } = await apiClient.request({
            method: 'GET',
            url: `api/v1/users/${store.state.user.data.id}/pointsOfSale/${id}/ideas`,
            params,
        });
        return data;
    },
};
