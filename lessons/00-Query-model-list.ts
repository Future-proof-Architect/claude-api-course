import { client } from "./shared/settings";

const models = await client.models.list();
models.data.forEach((m) => console.log(m.id));
