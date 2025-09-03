import { setupWorker } from "msw/browser";
import { mockTokenExpired } from "./handlers/_demo";
import { menuList } from "./handlers/_menu";
// Remove user auth handlers to use real Supabase auth
// import { signIn, userList } from "./handlers/_user";

// Only mock non-auth endpoints
const handlers = [mockTokenExpired, menuList];
const worker = setupWorker(...handlers);

export { worker };