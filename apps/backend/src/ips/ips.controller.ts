import { Controller, Get, Query } from "@nestjs/common";
import { IpsService } from "./ips.service";

@Controller("ips")
export class IpsController {
    constructor(private readonly service: IpsService) { }

    @Get("check")
    check(@Query("ip") ip: string) {
        return this.service.check(ip);
    }
}
