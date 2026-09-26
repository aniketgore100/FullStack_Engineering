
# React & JavaScript Interview Notes

A practical set of notes based on the concepts discussed: React Hooks,
Custom Hooks, `useCallback`, RTK Query mutations, React Router layout
architecture, and JavaScript Iterables/Iterators.

------------------------------------------------------------------------

# 1. React Hooks

## Definition

A **Hook** is a special React function that lets functional components
use React features such as state, effects, context, memoization, and
other React functionality.

Hooks generally start with `use`.

Examples:

``` js
useState()
useEffect()
useCallback()
useContext()
```

Third-party libraries can also provide Hooks:

``` js
useNavigate()
useGenerateCourseMutation()
```

## Why use Hooks?

Hooks allow us to:

-   Manage state in functional components.
-   Perform side effects.
-   Reuse React-related logic.
-   Access library functionality.
-   Keep components simpler and more reusable.

### Interview answer

> "Hooks are special functions in React that let functional components
> use features such as state, effects, context, and memoization. They
> also allow us to encapsulate and reuse component logic."

------------------------------------------------------------------------

# 2. Custom Hooks

## Definition

A **Custom Hook** is a JavaScript function whose name starts with `use`
and which can use other React Hooks to encapsulate reusable logic.

Example:

``` js
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  return {
    count,
    increment,
    decrement,
  };
}
```

Using it:

``` js
const { count, increment, decrement } = useCounter(10);
```

## Why use a Custom Hook?

Use a custom Hook when:

-   The same React-related logic is needed in multiple components.
-   A component is becoming too large because it contains API, state,
    error, or effect logic.
-   You want to separate business logic from UI.
-   You want reusable logic without duplicating code.

### Important

A custom Hook **does not create a new component**.

It extracts and reuses **logic**.

------------------------------------------------------------------------

# 3. Practical Custom Hook Example

The project example:

``` js
export function useGenerate(routeId) {
  const navigate = useNavigate();
  const [run, { isLoading }] = useGenerateCourseMutation();
  const [notice, setNotice] = useState(null);

  const generate = useCallback(
    async (prompt) => {
      setNotice(null);

      const result = await run(prompt);

      if (result.data) {
        return navigate(`/courses/${result.data.id}`);
      }

      const err = describeError(result.error);

      if (err.status === 401) return;

      setNotice({
        kind: err.status === 422 ? "rejected" : "error",
        message: err.message,
        suggestions: err.suggestions,
        prompt,
        forId: routeId ?? null,
      });
    },
    [run, navigate, routeId],
  );

  const current =
    notice && notice.forId === (routeId ?? null)
      ? notice
      : null;

  return {
    generate,
    loading: isLoading,
    notice: current,
  };
}
```

This Hook encapsulates:

-   API calling
-   Loading state
-   Error handling
-   Navigation
-   Route-specific notices

The component using it does not need to know all those implementation
details.

### Interview explanation

> "I created a custom `useGenerate` Hook to encapsulate the
> course-generation workflow. It calls the RTK Query mutation, handles
> loading and errors, and navigates to the generated course after a
> successful response. This keeps the UI component focused mainly on
> presentation."

------------------------------------------------------------------------

# 4. `useCallback`

## Definition

`useCallback` is a React Hook that **memoizes a function reference**.

In simple terms:

> It tells React to remember a function and reuse the same function
> reference until one of its dependencies changes.

Example:

``` js
const handleClick = useCallback(() => {
  console.log("clicked");
}, []);
```

Without `useCallback`, a function declared inside a component is
normally created again on every render.

``` js
const handleClick = () => {
  console.log("clicked");
};
```

Conceptually:

``` text
Render 1 → Function A
Render 2 → Function B
Render 3 → Function C
```

With `useCallback`:

``` text
Render 1 → Function A
Render 2 → Function A
Render 3 → Function A
```

If a dependency changes:

``` js
const handleClick = useCallback(() => {
  console.log(userId);
}, [userId]);
```

Then:

``` text
userId unchanged → same function reference
userId changed   → new function reference
```

## Why is this useful?

Creating a new function is usually **not expensive by itself**.

The important issue is **reference equality**.

JavaScript compares objects and functions by reference:

``` js
const a = () => {};
const b = () => {};

console.log(a === b); // false
```

Even though they contain the same code, they are different function
objects.

This can matter when:

### 1. Passing a callback to a memoized child

``` jsx
const Child = React.memo(function Child({ onClick }) {
  return <button onClick={onClick}>Click</button>;
});
```

If the parent creates a new callback every render:

``` text
old onClick !== new onClick
```

The child may render again because its prop changed.

With `useCallback`, the reference can remain stable.

### 2. Using a function as a dependency

``` js
useEffect(() => {
  // ...
}, [handleClick]);
```

If `handleClick` is recreated every render, React sees it as changed.

`useCallback` can prevent unnecessary effect executions when the
dependencies haven't actually changed.

## When NOT to use `useCallback`

Do not automatically use `useCallback` for every function.

It adds memoization overhead and complexity.

Use it when function reference stability actually matters, such as:

-   Passing callbacks to memoized child components.
-   Using functions in dependency arrays.
-   A measured performance issue where stable references help.

### Interview answer

> "`useCallback` memoizes a function reference so React can reuse the
> same function between renders until its dependencies change. It is
> useful when function reference equality matters, for example when
> passing callbacks to memoized children or using them as Hook
> dependencies."

------------------------------------------------------------------------

# 5. Callback vs `useCallback`

These are **not the same thing**.

## Callback

A callback is simply a function passed somewhere so that it can be
called later.

``` js
function processUser(callback) {
  callback("Aniket");
}

function greet(name) {
  console.log("Hello", name);
}

processUser(greet);
```

Here, `greet` is a callback.

## `useCallback`

`useCallback` is a React Hook used to memoize a function reference.

``` js
const greet = useCallback(() => {
  console.log("Hello");
}, []);
```

A callback can be memoized using `useCallback`.

``` text
Callback
= function passed to another function/component

useCallback
= React Hook used to memoize a function reference
```

------------------------------------------------------------------------

# 6. RTK Query Mutation Hooks

In the project, we saw:

``` js
const [run, { isLoading }] = useGenerateCourseMutation();
```

There is no manually written `run` function in the API file.

Instead, RTK Query **generates the Hook and its trigger function
automatically**.

The endpoint is defined as:

``` js
generateCourse: build.mutation({
  query: (prompt) => ({
    url: "/courses/preview",
    method: "POST",
    body: { prompt },
  }),
})
```

At the bottom:

``` js
export const {
  useGenerateCourseMutation,
} = api;
```

RTK Query generates:

``` js
useGenerateCourseMutation()
```

When we call:

``` js
const [run, { isLoading }] =
  useGenerateCourseMutation();
```

`run` is simply a local variable name for the generated **trigger
function**.

You could instead write:

``` js
const [generateCourse, { isLoading }] =
  useGenerateCourseMutation();
```

or:

``` js
const [trigger, { isLoading }] =
  useGenerateCourseMutation();
```

All are valid.

## Flow

``` text
generateCourse endpoint
        ↓
RTK Query generates
        ↓
useGenerateCourseMutation()
        ↓
returns [triggerFunction, mutationState]
        ↓
const [run, { isLoading }] = ...
        ↓
run(prompt)
        ↓
POST /api/courses/preview
```

### Interview answer

> "RTK Query automatically generates mutation Hooks from endpoint
> definitions. The first value returned by a mutation Hook is a trigger
> function. In my code I named that function `run`, and calling
> `run(prompt)` triggers the `generateCourse` API request."

------------------------------------------------------------------------

# 7. `baseQuery` and Authentication Flow

The API setup used:

``` js
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return headers;
  },
});
```

This establishes the common API behavior.

## `baseUrl`

``` js
baseUrl: "/api"
```

If an endpoint says:

``` js
url: "/courses"
```

the actual request becomes:

``` text
/api/courses
```

## `credentials: "include"`

This allows browser credentials such as cookies to be included in
requests.

This is useful when authentication uses cookies, including a
refresh-token cookie.

## `prepareHeaders`

It reads the access token from Redux:

``` js
const token = getState().auth.accessToken;
```

Then adds:

``` http
Authorization: Bearer <token>
```

to the request.

------------------------------------------------------------------------

# 8. Re-authentication Flow

The project has a wrapper:

``` js
const baseQueryWithReauth = async (
  args,
  thunkApi,
  extra
) => {
  let result =
    await rawBaseQuery(args, thunkApi, extra);

  if (result.error?.status === 401) {
    if (await refreshAccess(thunkApi)) {
      result =
        await rawBaseQuery(args, thunkApi, extra);
    } else {
      thunkApi.dispatch(loggedOut());
      thunkApi.dispatch(
        api.util.resetApiState()
      );
    }
  }

  return result;
};
```

The purpose is:

> If an API request returns `401`, try to refresh the access token and
> retry the original request.

Flow:

``` text
API request
    ↓
401 Unauthorized
    ↓
refresh access token
    ↓
success?
 ┌───────┴───────┐
YES              NO
 ↓                ↓
Retry request    Logout
```

This prevents the application from immediately logging the user out
whenever a short-lived access token expires.

------------------------------------------------------------------------

# 9. Preventing Multiple Refresh Requests

The project uses:

``` js
let refreshing = null;
```

and:

``` js
refreshing ??= (async () => {
  // refresh request
})();
```

This prevents multiple simultaneous API failures from creating multiple
refresh requests.

Conceptually:

``` text
Request A → 401 ─┐
Request B → 401 ─┼→ one refresh request
Request C → 401 ─┘
```

Instead of:

``` text
Request A → refresh
Request B → refresh
Request C → refresh
```

The shared `refreshing` Promise allows requests to wait for the same
refresh operation.

### Interview concept

This is commonly called **single-flight refresh** or **deduplicating
concurrent refresh requests**.

------------------------------------------------------------------------

# 10. RTK Query Cache and Tags

The API defines:

``` js
tagTypes: ["Course"]
```

Then:

``` js
const LIST = {
  type: "Course",
  id: "LIST",
};
```

A query can provide tags:

``` js
listCourses: build.query({
  query: () => "/courses",
  providesTags: [LIST],
})
```

A mutation can invalidate them:

``` js
generateCourse: build.mutation({
  ...
  invalidatesTags: [LIST],
})
```

This tells RTK Query that the course list may now be stale.

Conceptually:

``` text
listCourses
   ↓
provides Course/LIST

generateCourse
   ↓
invalidates Course/LIST
   ↓
RTK Query knows the list needs refreshing
```

This is one reason RTK Query is useful: it manages server-state caching
and synchronization.

------------------------------------------------------------------------

# 11. Optimistic Updates

The project also has:

``` js
setProgress: build.mutation({
  ...
  async onQueryStarted(
    { id, completed },
    { dispatch, queryFulfilled }
  ) {
```

The UI is updated **before the server confirms the operation**.

Example:

``` text
User clicks "Complete"
        ↓
Update UI immediately
        ↓
Send PATCH request
        ↓
Server response
      /     \
   Success  Failure
      ↓       ↓
 Keep UI   Rollback
```

The code stores undo patches:

``` js
const patches = [
  dispatch(
    api.util.updateQueryData(
      "getCourse",
      id,
      (course) => {
        course.progress = completed;
      }
    )
  ),
  ...
];
```

If the server rejects the request:

``` js
patches.forEach((p) => p.undo());
```

the UI is rolled back.

### Interview answer

> "An optimistic update changes the UI immediately and assumes the
> server request will succeed. If the request fails, the cached state is
> rolled back using the stored patch."

------------------------------------------------------------------------

# 12. React Router Layout Architecture

A clean architecture for the application is:

``` text
App
 ↓
AppLayout
 ├── Sidebar
 ├── Navbar
 └── Outlet
      ↓
    Home
      ↓
    ChatUI
```

## `App.jsx`

Responsible mainly for routing:

``` jsx
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
```

## `AppLayout.jsx`

Responsible for the global application shell:

-   Sidebar
-   Navbar
-   Main content area
-   Mobile navigation behavior

It uses:

``` jsx
<Outlet />
```

## What is `Outlet`?

`Outlet` is a React Router component that renders the element of the
currently matched nested route.

Example:

``` jsx
<Route element={<AppLayout />}>
  <Route path="/" element={<Home />} />
</Route>
```

The `Home` component appears where:

``` jsx
<Outlet />
```

is placed.

So:

``` text
AppLayout
    ↓
<main>
    ↓
<Outlet />
    ↓
<Home />
```

## Why use this architecture?

It avoids repeating the layout on every page.

Without nested layout routing, you might write:

``` jsx
<Home>
  <AppLayout />
</Home>
```

and repeat similar structure for every page.

With nested routes:

``` text
AppLayout
 ├── Home
 ├── Settings
 └── Profile
```

all pages automatically share the same application shell.

------------------------------------------------------------------------

# 13. `children` vs `Outlet`

These are related concepts but are not the same.

## `children`

Normal React component composition:

``` jsx
function Layout({ children }) {
  return (
    <main>
      {children}
    </main>
  );
}
```

Usage:

``` jsx
<Layout>
  <Home />
</Layout>
```

Here `<Home />` becomes `children`.

## `Outlet`

React Router's mechanism for nested route rendering:

``` jsx
function AppLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
```

The matching child route is automatically rendered inside the `Outlet`.

Use:

-   `children` for normal component composition.
-   `Outlet` for nested React Router layouts.

------------------------------------------------------------------------

# 14. Course Generation Flow

The overall course-generation flow discussed in the project is:

``` text
User enters prompt
       ↓
ChatUI
       ↓
generate(prompt)
       ↓
useGenerate()
       ↓
useGenerateCourseMutation()
       ↓
run(prompt)
       ↓
generateCourse endpoint
       ↓
POST /api/courses/preview
       ↓
Backend
       ↓
Course generated
       ↓
result.data.id
       ↓
navigate(`/courses/${id}`)
       ↓
URL becomes /courses/:id
       ↓
React Router provides id through useParams()
       ↓
SavedCourse receives id
       ↓
SavedCourse displays course
```

The important separation is:

``` text
ChatUI
→ user interaction

useGenerate
→ generation business logic

RTK Query
→ API/server-state logic

React Router
→ navigation

SavedCourse
→ course presentation
```

------------------------------------------------------------------------

# 15. Conditional UI Pattern

The `Home` component used this pattern:

``` jsx
{loading ? (
  <CourseSkeleton />
) : notice ? (
  <CourseNotice />
) : id ? (
  <SavedCourse id={id} />
) : null}
```

This means:

``` text
loading?
   ↓ YES → CourseSkeleton

NO
 ↓
notice?
   ↓ YES → CourseNotice

NO
 ↓
id?
   ↓ YES → SavedCourse

NO
 ↓
null
```

This is a common React pattern for representing different UI states.

------------------------------------------------------------------------

# 16. `useRef` for One-Time Behavior

The project used:

``` js
const started = useRef(false);
```

Then:

``` js
if (started.current) {
  return;
}

started.current = true;
```

`useRef` stores a value that persists between renders without causing a
re-render when changed.

Here it acts as a flag:

``` text
First effect run
    ↓
started.current === false
    ↓
set it to true
    ↓
run generation

Later effect run
    ↓
started.current === true
    ↓
return
```

This can be useful when an effect should only trigger an action once for
the lifetime of the mounted component.

------------------------------------------------------------------------

# 17. JavaScript Iterable

## Definition

An **iterable** is an object that can be iterated over using
JavaScript's iteration protocol.

An iterable provides:

``` js
Symbol.iterator
```

Examples:

``` js
Array
String
Set
Map
```

Example:

``` js
const arr = [10, 20, 30];

arr[Symbol.iterator];
```

Because arrays are iterable, this works:

``` js
for (const value of arr) {
  console.log(value);
}
```

------------------------------------------------------------------------

# 18. JavaScript Iterator

## Definition

An **iterator** is an object that performs the actual step-by-step
iteration.

It provides:

``` js
next()
```

Example:

``` js
const arr = [10, 20, 30];

const iterator = arr[Symbol.iterator]();
```

Now:

``` js
iterator.next();
// { value: 10, done: false }

iterator.next();
// { value: 20, done: false }

iterator.next();
// { value: 30, done: false }

iterator.next();
// { value: undefined, done: true }
```

The iterator returns objects with:

``` js
{
  value: ...,
  done: ...
}
```

------------------------------------------------------------------------

# 19. Iterable vs Iterator

  ----------------------------------------------------------------------------
  Feature                 Iterable                Iterator
  ----------------------- ----------------------- ----------------------------
  Meaning                 Something that can be   Object that performs
                          iterated                iteration

  Main protocol           `Symbol.iterator`       `next()`

  Gives you               Iterator                `{ value, done }`

  Example                 Array                   `array[Symbol.iterator]()`
  ----------------------------------------------------------------------------

Relationship:

``` text
Iterable
   ↓
Symbol.iterator()
   ↓
Iterator
   ↓
next()
   ↓
{ value, done }
```

### Easy interview answer

> "An iterable is an object that implements `Symbol.iterator`, meaning
> it can provide an iterator. An iterator is the object that implements
> `next()` and produces values one by one until `done` becomes true."

------------------------------------------------------------------------

# 20. Common Interview Questions

## What is a Hook?

> "A Hook is a special React function that lets functional components
> use React features such as state, effects, context, and memoization."

## What is a Custom Hook?

> "A custom Hook is a reusable function starting with `use` that can use
> other Hooks to encapsulate and share React-related logic."

## Why use Custom Hooks?

> "To separate reusable logic from UI and avoid duplicating state,
> effect, API, or business logic across components."

## What is `useCallback`?

> "`useCallback` memoizes a function reference and returns the same
> function between renders until its dependencies change."

## Why use `useCallback`?

> "It is useful when function reference equality matters, such as when
> passing a callback to a memoized child or using a function as a
> dependency."

## Is `useCallback` the same as a callback?

> "No. A callback is a function passed to another function or component.
> `useCallback` is a React Hook used to memoize a function reference."

## What does `useGenerateCourseMutation()` return?

> "RTK Query generates a mutation Hook. Its first returned value is a
> trigger function used to execute the mutation, and the second value
> contains mutation state such as `isLoading` and error information."

## What is `Outlet`?

> "`Outlet` is a React Router component that renders the currently
> matched child route inside a parent layout."

## What is an iterable?

> "An iterable is an object that implements `Symbol.iterator` and can
> provide an iterator for iteration."

## What is an iterator?

> "An iterator is an object with a `next()` method that returns
> `{ value, done }` to produce values one by one."

------------------------------------------------------------------------

# 21. Quick Revision Sheet

``` text
HOOK
→ React function that provides React functionality.

CUSTOM HOOK
→ Reusable function starting with "use".
→ Encapsulates React-related logic.

useCallback
→ Memoizes a function reference.
→ Same function reference until dependencies change.
→ Useful when reference equality matters.

CALLBACK
→ Function passed to another function/component.

RTK QUERY MUTATION
→ API operation that changes/submits data.
→ Returns a trigger function + mutation state.

TRIGGER FUNCTION
→ Function used to execute an RTK Query mutation.
→ Example: run(prompt).

OUTLET
→ Where a matched nested route renders inside a layout.

CHILDREN
→ React content passed between a component's opening
  and closing tags.

ITERABLE
→ Has Symbol.iterator.
→ Can provide an iterator.

ITERATOR
→ Has next().
→ Produces { value, done }.

OPTIMISTIC UPDATE
→ Update UI/cache immediately.
→ Send request afterward.
→ Roll back if request fails.

BASE QUERY
→ Common API request configuration/behavior.

401
→ Unauthorized.
→ In this project: try token refresh, otherwise logout.

422
→ Request understood but rejected due to validation/business rules.
```

------------------------------------------------------------------------

# 22. Most Important Mental Models

### React logic

``` text
Component
   ↓
Custom Hook
   ↓
Reusable business/UI logic
```

### API logic

``` text
Component
   ↓
Custom Hook
   ↓
RTK Query Hook
   ↓
Mutation trigger
   ↓
Base Query
   ↓
Backend API
```

### Layout architecture

``` text
App
 ↓
Routes
 ↓
AppLayout
 ├── Navbar
 ├── Sidebar
 └── Outlet
      ↓
    Page
      ↓
    Components
```

### Iteration

``` text
Iterable
 ↓ Symbol.iterator()
Iterator
 ↓ next()
{ value, done }
```

------------------------------------------------------------------------

# Final Interview Rule

When explaining any concept in an interview, use this structure:

``` text
1. Definition
2. Why it exists
3. When to use it
4. Small example
5. Practical project example
```

For example, for `useCallback`:

> "useCallback is a React Hook that memoizes a function reference. It
> exists because function references are recreated on renders, and
> reference changes can cause unnecessary child renders or effects. I
> use it when function identity matters, such as passing callbacks to
> memoized children or using callbacks in dependency arrays. In my
> project, I used it in a custom `useGenerate` Hook to keep the
> `generate` function stable based on its dependencies."


# React State Management & RTK Query --- Interview Notes

## 1. The Big Picture

A useful way to think about a React application is:

``` text
Component
   │
   ├── useState / useRef / useEffect
   │       ↓
   │    Local UI behavior
   │
   ├── Context
   │       ↓
   │    Shared React state
   │
   └── Redux Toolkit
           │
           ├── Slices
           │     ↓
           │   Client/application state
           │
           └── RTK Query
                 ↓
               Server/API state
```

The most important interview distinction:

-   **`useState`** → local component state.
-   **`useRef`** → persistent mutable reference; commonly used for DOM
    elements without causing re-renders.
-   **Context** → share values across a component tree without prop
    drilling.
-   **Redux slice** → centralized client/application state.
-   **RTK Query** → fetching, caching, and managing server/API state.
-   **Redux store** → central container that holds Redux state,
    including slice state and RTK Query's cache.

------------------------------------------------------------------------

# 2. `useState`

## Definition

`useState` is a React Hook used to store state that belongs to a
component.

Example:

``` jsx
const [prompt, setPrompt] = useState("");
```

Here:

-   `prompt` → current state.
-   `setPrompt` → function used to update the state.

When state changes, React schedules a re-render.

## When to use it

Use `useState` when:

-   The state is mainly needed by one component.
-   The state is simple/local.
-   You don't need unrelated components to access it.

Examples:

``` text
Input value
Modal open/closed
Dropdown open/closed
Loading flag local to a component
Form fields
Temporary UI state
```

Example:

``` jsx
const [prompt, setPrompt] = useState("");

<textarea
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
/>
```

## Interview answer

> "I use `useState` for local component state when the state doesn't
> need to be shared across unrelated parts of the application."

------------------------------------------------------------------------

# 3. `useRef`

## Definition

`useRef` creates a persistent reference whose `.current` value survives
re-renders without causing a re-render when it changes.

Example:

``` jsx
const textareaRef = useRef(null);

<textarea ref={textareaRef} />
```

After mounting:

``` js
textareaRef.current
```

points to the actual DOM `<textarea>` element.

## Why was it used in the ChatUI?

The textarea needed to automatically grow according to its content.

``` js
const el = textareaRef.current;

el.style.height = "auto";
el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
```

Here:

``` text
textareaRef.current
        ↓
actual textarea DOM element
        ↓
scrollHeight
        ↓
calculate required height
        ↓
set element height
```

The DOM doesn't automatically know that your React application wants
this particular auto-grow behavior.

Your code explicitly tells it what to do.

## `rows={1}`

``` jsx
<textarea rows={1} />
```

means:

> Start with one visible text row.

It is the initial/default size.

Then JavaScript dynamically changes the height based on `scrollHeight`.

## When to use `useRef`

Common use cases:

-   Accessing a DOM element.
-   Focusing an input.
-   Reading measurements such as `scrollHeight`.
-   Controlling video/audio.
-   Storing a value that should persist between renders but should not
    trigger a render when changed.
-   Keeping timer IDs or other mutable values.

## `useState` vs `useRef`

``` text
useState
   ↓
Stores state
   ↓
Changing state
   ↓
React re-renders

useRef
   ↓
Stores a mutable reference/value
   ↓
Changing .current
   ↓
No automatic re-render
```

## Interview answer

> "`useRef` is useful when I need a persistent mutable reference,
> especially to access a DOM element, without triggering a React
> re-render when the reference changes."

------------------------------------------------------------------------

# 4. `useEffect`

## Definition

`useEffect` is used to synchronize a component with something outside
React's rendering process.

Example from ChatUI:

``` jsx
useEffect(() => {
  const el = textareaRef.current;

  if (!el) return;

  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
}, [prompt]);
```

The dependency array:

``` js
[prompt]
```

means:

> Run this effect after `prompt` changes.

## ChatUI flow

``` text
User types
    ↓
onChange
    ↓
setPrompt(...)
    ↓
prompt changes
    ↓
component re-renders
    ↓
useEffect runs
    ↓
measure textarea
    ↓
update textarea height
```

## Another use in ChatUI

``` jsx
useEffect(() => {
  bottomRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "end",
  });
}, [messages, isLoading]);
```

This keeps the chat scrolled to the bottom when messages or loading
state changes.

------------------------------------------------------------------------

# 5. React Context

## Definition

Context provides a way to share data with components deeper in a React
tree without manually passing props through every intermediate
component.

Example:

``` js
const AuthContext = createContext(null);
```

Then:

``` jsx
<AuthContext.Provider value={value}>
  {children}
</AuthContext.Provider>
```

The provider makes the value available to descendant components.

## Your AuthContext example

The context contains:

``` js
{
  user,
  loading,
  login,
  completeLogin,
  logout
}
```

A component can access it using:

``` js
const { user, logout } = useAuth();
```

instead of:

``` jsx
<Navbar user={user} logout={logout} />
```

## Flow

``` text
AuthProvider
      ↓
AuthContext
      ↓
  ┌───┴────┐
  ↓        ↓
Navbar   Sidebar
  ↓        ↓
useAuth() useAuth()
```

## Why create a custom `useAuth` hook?

Instead of repeatedly writing:

``` js
useContext(AuthContext)
```

you create:

``` js
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
```

Now components simply use:

``` js
const { user, logout } = useAuth();
```

The custom hook also provides a useful safety check.

## When to use Context

Good examples:

-   Authentication information.
-   Theme.
-   Locale/language.
-   Small pieces of shared application configuration.

## Context vs Redux

Context is primarily a React mechanism for sharing values through a
component tree.

Redux is a dedicated state-management architecture with:

-   Centralized state.
-   Actions.
-   Reducers.
-   Middleware.
-   DevTools.
-   Predictable update patterns.
-   Integration with RTK Query.

Do not use Redux simply because data is shared. Context may be enough
for simple shared values.

------------------------------------------------------------------------

# 6. Redux Toolkit

## Definition

Redux Toolkit (RTK) is the official recommended way to write Redux
logic.

It simplifies:

-   Store configuration.
-   Reducers.
-   Actions.
-   Immutable updates.
-   Middleware setup.
-   Async/API integration.

RTK provides APIs such as:

``` text
configureStore
createSlice
createAsyncThunk
createApi
```

------------------------------------------------------------------------

# 7. Redux Store

## Definition

The Redux store is the central container that holds the application's
Redux state.

Example:

``` js
export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    ui: uiReducer,

    [api.reducerPath]: api.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
```

Conceptually:

``` text
Redux Store
│
├── auth
│
├── chat
│
├── ui
│
└── api
     └── RTK Query cache
```

## Why do we need the Provider?

Your React application needs:

``` jsx
<Provider store={store}>
  <App />
</Provider>
```

This makes the Redux store available to components.

Without it:

``` text
ChatUI
   ↓
useGenerateMutation()
   ↓
Where is the Redux store?
   ↓
ERROR
```

With it:

``` text
Provider
   ↓
Redux Store
   ↓
App
   ↓
ChatUI
   ↓
useGenerateMutation()
```

The error:

``` text
could not find react-redux context value;
please ensure the component is wrapped in a <Provider>
```

means a Redux hook was used outside the Redux Provider.

------------------------------------------------------------------------

# 8. Redux Slice

## Definition

A slice is a Redux Toolkit feature that contains the state, reducers,
and automatically generated actions for one logical part of the
application.

Example:

``` js
const chatSlice = createSlice({
  name: "chat",

  initialState: {
    messages: [],
  },

  reducers: {
    addMessage: {
      reducer(state, action) {
        state.messages.push(action.payload);
      },
    },
  },
});
```

The slice manages:

``` text
chat
  ↓
messages
```

## Why use a slice?

Use a slice when state is application-level/client state that multiple
parts of the application may need.

For example:

``` text
authSlice
→ authentication-related client state

chatSlice
→ current chat/application state

uiSlice
→ sidebar, modal, UI preferences, etc.
```

## `useSelector`

A component reads Redux state using:

``` js
const messages = useSelector(selectMessages);
```

where:

``` js
export const selectMessages = (state) => state.chat.messages;
```

This means:

``` text
Redux Store
    ↓
state.chat.messages
    ↓
selectMessages()
    ↓
ChatUI
```

## `useDispatch`

A component changes Redux state by dispatching an action:

``` js
dispatch(addMessage(...));
```

Flow:

``` text
Component
   ↓
dispatch(action)
   ↓
Reducer
   ↓
Redux Store updated
   ↓
useSelector gets new state
   ↓
Component re-renders
```

------------------------------------------------------------------------

# 9. Why not just use `useState` for chat messages?

You absolutely can.

For a small component:

``` jsx
const [messages, setMessages] = useState([]);
```

may be simpler and better.

The difference is scope.

### `useState`

``` text
ChatUI
  ↓
messages
```

The state belongs to that component.

### Redux slice

``` text
             Redux Store
                  ↓
               messages
                  ↓
       ┌──────────┼──────────┐
       ↓          ↓          ↓
    ChatUI     Sidebar    History
```

Multiple components can access the same state.

## Interview answer

> "I don't use Redux just because state exists. I use Redux when the
> state has application-level scope, needs to be shared across
> components, or needs centralized coordination such as clearing chat
> state when the session expires."

------------------------------------------------------------------------

# 10. `extraReducers`

Your chat slice contains:

``` js
extraReducers: (builder) => {
  builder
    .addCase(logout.pending, () => ({ messages: [] }))
    .addCase(sessionExpired, () => ({ messages: [] }));
}
```

This allows one slice to respond to actions created elsewhere.

For example:

``` text
User logs out
     ↓
logout action
     ↓
chatSlice sees logout.pending
     ↓
messages = []
```

Similarly:

``` text
Session expires
     ↓
sessionExpired action
     ↓
chatSlice
     ↓
messages = []
```

This is useful for cross-feature coordination.

------------------------------------------------------------------------

# 11. RTK Query

## Definition

RTK Query is the data-fetching and caching solution included with Redux
Toolkit.

It is designed primarily for **server state**.

It handles things such as:

-   API requests.
-   Loading state.
-   Error state.
-   Caching.
-   Request lifecycle.
-   Refetching.
-   Cache invalidation.
-   Generated React hooks.

------------------------------------------------------------------------

# 12. `createApi`

Example:

``` js
export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),

  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
    }),

    generate: builder.mutation({
      query: (prompt) => ({
        url: "/generate",
        method: "POST",
        body: { prompt },
      }),
    }),
  }),
});
```

This defines the communication between the frontend and backend.

------------------------------------------------------------------------

# 13. Query vs Mutation

## Query

A query is generally used to retrieve data.

``` js
getUsers: builder.query({
  query: () => "/users",
})
```

Example:

``` text
GET /users
```

Generated hook:

``` js
useGetUsersQuery()
```

## Mutation

A mutation is generally used for operations that send/change data or
trigger a server-side operation.

``` js
generate: builder.mutation({
  query: (prompt) => ({
    url: "/generate",
    method: "POST",
    body: { prompt },
  }),
})
```

Generated hook:

``` js
useGenerateMutation()
```

Interview shortcut:

> Query = primarily read/fetch server data.

> Mutation = create/update/delete or trigger a server operation.

------------------------------------------------------------------------

# 14. Using a Mutation in a Component

``` js
const [generate, { isLoading }] = useGenerateMutation();
```

RTK Query gives:

``` text
generate
    ↓
Function that triggers the API request

isLoading
    ↓
Current request state
```

Then:

``` js
const response = await generate(cleanPrompt).unwrap();
```

Flow:

``` text
ChatUI
   ↓
generate(prompt)
   ↓
RTK Query
   ↓
HTTP POST
   ↓
Backend
   ↓
Response
   ↓
RTK Query
   ↓
ChatUI
```

------------------------------------------------------------------------

# 15. What does `.unwrap()` do?

Without `unwrap()`:

``` js
const result = await generate(prompt);
```

You get RTK Query's action result structure.

With:

``` js
const response = await generate(prompt).unwrap();
```

you get the actual successful response data, and rejected requests throw
an error.

This makes normal `try/catch` code convenient:

``` js
try {
  const response = await generate(prompt).unwrap();

  console.log(response);
} catch (error) {
  console.error(error);
}
```

------------------------------------------------------------------------

# 16. RTK Query vs Redux Slice

This is one of the most important interview concepts.

## Redux Slice

Use a slice primarily for **client/application state**.

Examples:

``` text
sidebarOpen
selectedDocument
currentChatMessages
theme
UI preferences
local application flags
```

## RTK Query

Use RTK Query primarily for **server state**.

Examples:

``` text
users from database
documents from backend
chat history from API
generated AI response
server-side data
```

Think:

``` text
Client owns it
    ↓
Redux slice

Server owns it
    ↓
RTK Query
```

------------------------------------------------------------------------

# 17. Important Nuance: API Response Does Not Have to Go Into a Slice

Suppose:

``` js
const response = await generate(prompt).unwrap();
```

You do NOT automatically need:

``` js
dispatch(addMessage(response));
```

just because the response came from an API.

RTK Query already manages server data and caching.

You put something into a Redux slice when that data represents
application/client state that your application wants to manage
centrally.

For a chat application, you might intentionally keep the currently
displayed conversation in `chatSlice`, while RTK Query handles
communication with the backend.

------------------------------------------------------------------------

# 18. Complete Data Flow in Your Application

Your architecture can be understood as:

``` text
                         React Component
                              │
               ┌──────────────┴──────────────┐
               │                             │
          Redux hooks                    API hooks
               │                             │
       useSelector / dispatch         useQuery / useMutation
               │                             │
               ↓                             ↓
          Redux Slice                  RTK Query
               │                             │
               ↓                             ↓
          Redux Store                  API request
                                             │
                                             ↓
                                          Backend
                                             │
                                             ↓
                                         Response
                                             │
                                             ↓
                                        RTK Query
                                             │
                                             ↓
                                         Component
```

------------------------------------------------------------------------

# 19. Authentication Token with RTK Query

A common pattern is to add the access token in `prepareHeaders`.

``` js
baseQuery: fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,

  prepareHeaders: (headers) => {
    const token = getAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
})
```

Now every API request can automatically contain:

``` http
Authorization: Bearer <access-token>
```

So a component doesn't need to manually do:

``` js
generate(prompt, token)
```

Instead:

``` js
generate(prompt)
```

and `baseQuery` attaches the token.

------------------------------------------------------------------------

# 20. Authentication Request Flow

``` text
User logs in
     ↓
Access token stored
     ↓
Component calls RTK Query
     ↓
fetchBaseQuery
     ↓
prepareHeaders()
     ↓
Get access token
     ↓
Authorization: Bearer <token>
     ↓
Backend
     ↓
Verify token
     ↓
Allow / reject request
```

Important security principle:

> The frontend does not secure the API. The backend must verify the
> token.

Even if the frontend sends:

``` http
Authorization: Bearer ...
```

the backend must independently validate it.

------------------------------------------------------------------------

# 21. Vite Environment Variables

Because your project uses Vite:

``` js
import.meta.env.VITE_API_URL
```

is used instead of:

``` js
process.env.BASE_URL
```

Example `.env`:

``` env
VITE_API_URL=http://localhost:5000/api
```

Vite exposes frontend environment variables only when they use the
`VITE_` prefix.

After changing `.env`, restart the Vite dev server.

------------------------------------------------------------------------

# 22. `process.env` vs `import.meta.env`

For your Vite React application:

``` js
// Vite
import.meta.env.VITE_API_URL
```

Do not assume this works:

``` js
process.env.BASE_URL
```

`process` is a Node.js-oriented global and is not automatically
available in normal browser-side Vite code.

------------------------------------------------------------------------

# 23. The `Provider` Setup

Your `main.jsx` should have:

``` jsx
import { Provider } from "react-redux";
import { store } from "./app/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
```

Conceptually:

``` text
Provider
   ↓
Redux Store
   ↓
BrowserRouter
   ↓
AuthProvider
   ↓
App
   ↓
ChatUI
```

The Redux Provider makes the store available to Redux hooks such as:

``` js
useSelector()
useDispatch()
useGenerateMutation()
```

------------------------------------------------------------------------

# 24. Why RTK Query Is Added to the Store

In `store.js`:

``` js
reducer: {
  [api.reducerPath]: api.reducer,
}
```

and:

``` js
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(api.middleware)
```

These connect RTK Query to Redux.

Conceptually:

``` text
Redux Store
     │
     └── api
          │
          ├── API cache
          ├── request state
          └── RTK Query data
```

The middleware handles RTK Query's request/cache lifecycle.

------------------------------------------------------------------------

# 25. Interview Comparison Table

  ---------------------------------------------------------------------------
  Tool              Main purpose      Typical example       Causes re-render?
  ----------------- ----------------- --------------------- -----------------
  `useState`        Local component   Form input            Yes
                    state                                   

  `useRef`          Persistent        Focus input           No when
                    mutable reference                       `.current`
                    / DOM access                            changes

  `useEffect`       Synchronize with  Fetch/DOM/scroll      Not directly
                    external effects                        

  Context           Share values      Auth/theme            Consumers update
                    through component                       when context
                    tree                                    changes

  Redux Slice       Centralized       Chat/UI/auth state    Yes, subscribed
                    client state                            components

  RTK Query         Server/API state  Users/documents/API   Yes, subscribed
                                      responses             components

  Redux Store       Central state     Holds slices + RTK    N/A
                    container         Query cache           
  ---------------------------------------------------------------------------

------------------------------------------------------------------------

# 26. When Should I Use What?

## Use `useState` when:

The state belongs to one component.

``` text
Input value
Modal state
Dropdown state
Temporary form state
```

## Use `useRef` when:

You need a persistent reference without triggering renders.

``` text
DOM element
Timer ID
Previous value
Scroll position/reference
```

## Use Context when:

A relatively simple value needs to be shared across a component tree.

``` text
Auth
Theme
Locale
Configuration
```

## Use Redux Slice when:

The application owns the state and multiple areas of the application
need it.

``` text
Chat state
UI state
Selected document
Application preferences
Complex client state
```

## Use RTK Query when:

The server owns the data and the frontend needs to
fetch/cache/synchronize it.

``` text
Users
Documents
Chat history
AI responses
Backend resources
```

------------------------------------------------------------------------

# 27. Common Interview Questions

## Q: Why not use Redux for everything?

Answer:

> "Redux is useful for centralized application state, but not every
> piece of state needs to be global. I use local state for
> component-specific state, Context for simple shared values, Redux
> slices for shared client state, and RTK Query for server state."

------------------------------------------------------------------------

## Q: Why use RTK Query instead of `fetch`?

Answer:

> "RTK Query abstracts API fetching and provides loading/error state,
> caching, request lifecycle management, refetching, cache invalidation,
> and generated React hooks. It also integrates directly with Redux."

------------------------------------------------------------------------

## Q: Does RTK Query replace Redux?

Answer:

> "RTK Query is part of Redux Toolkit and manages server state, but it
> doesn't replace Redux slices for client-side application state. They
> solve different problems."

------------------------------------------------------------------------

## Q: Why do we need a Redux Provider?

Answer:

> "The Provider makes the Redux store available through React context to
> components below it, allowing hooks such as `useSelector`,
> `useDispatch`, and RTK Query hooks to access the store."

------------------------------------------------------------------------

## Q: What is a Redux slice?

Answer:

> "A slice represents one logical feature of Redux state and contains
> its initial state, reducers, and generated action creators."

------------------------------------------------------------------------

## Q: Why use `useSelector`?

Answer:

> "`useSelector` reads a specific part of the Redux store from a React
> component and subscribes the component to changes in that selected
> state."

------------------------------------------------------------------------

## Q: Why use `useDispatch`?

Answer:

> "`useDispatch` gives the component access to the Redux dispatch
> function so it can send actions to reducers."

------------------------------------------------------------------------

## Q: What is the difference between query and mutation in RTK Query?

Answer:

> "Queries are primarily used to retrieve server data, while mutations
> are used for operations that change server data or trigger server-side
> operations."

------------------------------------------------------------------------

## Q: Why use `unwrap()`?

Answer:

> "`unwrap()` lets me work with the actual fulfilled response data and
> makes rejected requests throw an error, which works naturally with
> `try/catch`."

------------------------------------------------------------------------

## Q: Why use `useRef` instead of `useState` for a DOM element?

Answer:

> "A ref can hold the DOM element directly and changing `.current`
> doesn't trigger a render. State is intended for data that affects
> rendering."

------------------------------------------------------------------------

# 28. Your Chat Application Architecture

Based on the structure you built:

``` text
src/
│
├── app/
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── chatSlice.js
│   │   └── uiSlice.js
│   │
│   └── store.js
│
├── services/
│   └── api.js
│
├── components/
│   ├── ChatUI.jsx
│   ├── Navbar.jsx
│   └── Sidebar.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── layouts/
│   └── AppLayout.jsx
│
└── pages/
```

A clean conceptual architecture is:

``` text
                    React App
                       │
       ┌───────────────┼────────────────┐
       │               │                │
     Local           Context          Redux
     State                              │
       │                                │
   useState                        ┌────┴─────┐
   useRef                          │          │
   useEffect                    Slices    RTK Query
                                  │          │
                            Client state   Server state
                                             │
                                             ↓
                                          Backend
```

------------------------------------------------------------------------

# 29. Final Mental Model

Remember these five questions:

### 1. "Does only this component need it?"

Use:

``` text
useState
```

### 2. "Do I need a persistent reference or DOM element?"

Use:

``` text
useRef
```

### 3. "Do many components need a simple shared value?"

Consider:

``` text
Context
```

### 4. "Is this shared client/application state?"

Use:

``` text
Redux Slice
```

### 5. "Does this data come from the backend?"

Use:

``` text
RTK Query
```

The most important distinction:

``` text
                    WHO OWNS THE DATA?

                  ┌───────────────┐
                  │     Data      │
                  └───────┬───────┘
                          │
             ┌────────────┴────────────┐
             │                         │
       Frontend owns it          Backend owns it
             │                         │
             ↓                         ↓
       Redux / local state          RTK Query
             │                         │
       useState / slice             API cache
```

And remember:

> **State location should be determined by ownership, scope, and
> lifecycle --- not simply by whether the data exists.**

This is the core idea behind deciding between React state, Context,
Redux slices, and RTK Query.
