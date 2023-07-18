export const config = {
  basePath: "https://oai.hconeai.com/v1",
  baseOptions: {
    headers: {
      "Helicone-Auth": "Bearer "+process.env.HELICONE_AUTH_API_KEY,
    },
  }
}