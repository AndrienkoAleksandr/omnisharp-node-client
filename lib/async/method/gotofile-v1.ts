import * as OmniSharp from "../../omnisharp-server";
import {AsyncClient} from "../async-client-base";
import {request} from "../../helpers/decorators";
import {gotofile} from "../../helpers/preconditions";

request(AsyncClient.prototype, "gotofile", gotofile);

declare module "../async-client-base" {
    interface AsyncClient {
        gotofile(request: OmniSharp.Models.GotoFileRequest, options?: OmniSharp.RequestOptions): Promise<OmniSharp.Models.QuickFixResponse>;
    }
}