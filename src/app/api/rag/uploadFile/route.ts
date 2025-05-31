import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const formData: FormData = await request.formData();
  const uploadedFile = formData.get("file");
  const fileNameForUser = formData.get("name")
  const fileName = uuidv4();

  if (uploadedFile instanceof File) {
    const supabase = await createClient();
    const responseFromGetUser = await supabase.auth.getUser();
    if (responseFromGetUser.data.user) {
      const user_id = responseFromGetUser.data.user.id;
      const responseFromStorage = await supabase.storage
        .from("user-uploads")
        .upload(`files/${user_id}/${fileName}`, uploadedFile);

      console.log(responseFromStorage.data);

      if (!responseFromStorage.error) {
        const responseFromDocuments = await supabase
          .from("documents")
          .insert({
            user_id: user_id,
            title: fileNameForUser,
            path: responseFromStorage.data.path,
          })
          .select();

        if (!responseFromDocuments.error) {
          return Response.json({ responseFromStorage, responseFromDocuments });
        }

        return Response.json(
          { error: responseFromDocuments.error.message },
          {
            status: 400,
          }
        );
      }

      console.log(responseFromStorage.error);
      return Response.json(
        { error: responseFromStorage.error.message },
        {
          status: 400,
        }
      );
    }

    return Response.json({ error: "User not found" }, { status: 401 });
  }

  return Response.json({ error: "Form data is not file" }, { status: 400 });
}
