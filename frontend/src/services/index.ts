import { AuthService } from "./AuthService";
import { EntriesService} from "./EntriesService";

export const authService = new AuthService("/api/auth");
export const entriesService = new EntriesService("/api/entries");
entriesService.authService = authService;