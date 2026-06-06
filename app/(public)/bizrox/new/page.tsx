// Redirect /bizrox/new → /bizrox (composer is embedded in the feed)
import { redirect } from "next/navigation";
export default function NewPostPage() {
  redirect("/bizrox");
}
