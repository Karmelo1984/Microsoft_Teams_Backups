import axios, { AxiosInstance, AxiosResponse } from 'axios';

export default class APIRequestManager {
    private readonly instance: AxiosInstance;

    constructor(authToken: string) {
        this.instance = axios.create({
            headers: {
                Accept: 'application/json, text/plain, */*',
                Authorization: `Bearer ${authToken}`,
                'Sec-Fetch-Mode': 'cors',
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
            },
        });
    }

    async fetchResponse(apiUrl: string): Promise<any[]> {
        let response: any = undefined;
        const res: AxiosResponse<any> = await this.instance.get(apiUrl);

        if (res.data) {
            response = res.data;
        }

        return response;
    }
}
