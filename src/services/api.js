import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"


export const api = createApi({
    reducerPath : "api",

    baseQuery : fetchBaseQuery({
        baseUrl : process.env.BASE_URL
    }),

    endpoints : (builder) => ({
        getUsers: builder.query({
            query: () => "/users"
        }),
    }),
});

export const {useGetUsersQuery} = api;