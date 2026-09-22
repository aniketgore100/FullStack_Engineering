import { useState, useMemo, useEffect } from "react";
import { useGetUsersQuery } from "../services/usersAPI";

export const Search = () => {
    const [search, setSearch] = useState("");
    const { data, error, isLoading } = useGetUsersQuery();
    const [count, setCount] = useState(0);

    const users = data?.users || []

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            console.log("filter called ::")
            return user.firstName.toLowerCase().includes(search.toLowerCase())
        });
    }, [users, search])


    if (isLoading) {
        return <h2>Loading</h2>
    }

    if (error) {
        return <h2>Something went wrong</h2>;
    }




    return (
        <div>
            <input
                type="text"
                placeholder="Search Here"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <br />
            <div>
                {
                    filteredUsers.map((user) => {
                        return (
                            <div key={user.id}>
                                {user.firstName} {user.lastName}
                            </div>
                        )
                    })
                }
            </div>



            <button onClick={() => setCount(count + 1)}>
                Count: {count}
            </button>
        </div>
    )
}