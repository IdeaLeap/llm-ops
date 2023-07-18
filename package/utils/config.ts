import 'dotenv/config'
export const config = {
  basePath: 'https://oai.hconeai.com/v1',
  baseOptions: {
    headers: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      'Helicone-Auth': `Bearer ${process.env.HELICONE_AUTH_API_KEY}`,
    },
  },
}
