import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import { getAccessToken, refreshTokens } from "../lib/auth";



const rawBaseQuery = fetchBaseQuery({
    baseUrl : import.meta.env.VITE_API_URL ?? "/api",
    prepareHeaders : (headers) => {
        const token = getAccessToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQuery = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);
    if (result.error?.status === 401 && (await refreshTokens())) {
        result = await rawBaseQuery(args, api, extraOptions);
    }
    return result;
};

export const api = createApi({
    reducerPath : "api",

    baseQuery,

    endpoints : (builder) => ({

        generate : builder.mutation({
            query : (prompt) => (
                console.log("prompt :: ", prompt),
                {
                url : "api/prompt/generate",
                method : "POST",
                body : {prompt}
            }),
        }),

    }),
});

export const {useGetUsersQuery, useGenerateMutation} = api;