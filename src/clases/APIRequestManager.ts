import axios, { AxiosInstance, AxiosResponse } from 'axios';
import path from 'path';
import fs from 'fs';

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

    async fetchResponseImage(apiUrl: string, path_image: string): Promise<void> {
        let response: any = undefined;
        const res: AxiosResponse<any> = await this.instance({
            method: 'get',
            url: apiUrl,
            responseType: 'stream',
        });

        if (res.data) {
            response = res.data;
        }
        await res.data.pipe(fs.createWriteStream(path_image));
    }
}
