import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"

export const usersAPI = createApi({
    reducerPath : "usersApi",

    baseQuery : fetchBaseQuery({
        baseUrl : "https://dummyjson.com/"
    }),

    endpoints : (builder) => ({
        getUsers : builder.query({
            query: () => "users?limit=0",
        }),
    }),

})

export const {useGetUsersQuery} = usersAPI;

