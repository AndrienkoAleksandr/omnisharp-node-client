import {ReplaySubject, Observable} from "rx";
import * as _ from 'lodash';
import {ClientV1} from "./client-v1";
import {ObservationClientBase, CombinationClientBase, CombinationKey} from "./composite-client-base";

export class ObservationClientV1<T extends ClientV1> extends ObservationClientBase<T> {
    public observeUpdatebuffer: typeof ClientV1.prototype.observeUpdatebuffer;
    public observeChangebuffer: typeof ClientV1.prototype.observeChangebuffer;
    public observeCodecheck: typeof ClientV1.prototype.observeCodecheck;
    public observeFormatAfterKeystroke: typeof ClientV1.prototype.observeFormatAfterKeystroke;
    public observeFormatRange: typeof ClientV1.prototype.observeFormatRange;
    public observeCodeformat: typeof ClientV1.prototype.observeCodeformat;
    public observeAutocomplete: typeof ClientV1.prototype.observeAutocomplete;
    public observeFindimplementations: typeof ClientV1.prototype.observeFindimplementations;
    public observeFindsymbols: typeof ClientV1.prototype.observeFindsymbols;
    public observeFindusages: typeof ClientV1.prototype.observeFindusages;
    public observeGotodefinition: typeof ClientV1.prototype.observeGotodefinition;
    public observeGotofile: typeof ClientV1.prototype.observeGotofile;
    public observeGotoregion: typeof ClientV1.prototype.observeGotoregion;
    public observeNavigateup: typeof ClientV1.prototype.observeNavigateup;
    public observeNavigatedown: typeof ClientV1.prototype.observeNavigatedown;
    public observeRename: typeof ClientV1.prototype.observeRename;
    public observeSignatureHelp: typeof ClientV1.prototype.observeSignatureHelp;
    public observeCheckalivestatus: typeof ClientV1.prototype.observeCheckalivestatus;
    public observeCheckreadystatus: typeof ClientV1.prototype.observeCheckreadystatus;
    public observeCurrentfilemembersastree: typeof ClientV1.prototype.observeCurrentfilemembersastree;
    public observeCurrentfilemembersasflat: typeof ClientV1.prototype.observeCurrentfilemembersasflat;
    public observeTypelookup: typeof ClientV1.prototype.observeTypelookup;
    public observeFilesChanged: typeof ClientV1.prototype.observeFilesChanged;
    public observeProjects: typeof ClientV1.prototype.observeProjects;
    public observeProject: typeof ClientV1.prototype.observeProject;
    public observeGetcodeactions: typeof ClientV1.prototype.observeGetcodeactions;
    public observeRuncodeaction: typeof ClientV1.prototype.observeRuncodeaction;
    public observeGettestcontext: typeof ClientV1.prototype.observeGettestcontext;

    constructor(clients: T[] = []) {
        super(clients);

        this.observeUpdatebuffer = this.makeMergeObserable(client => client.observeUpdatebuffer);
        this.observeChangebuffer = this.makeMergeObserable(client => client.observeChangebuffer);
        this.observeCodecheck = this.makeMergeObserable(client => client.observeCodecheck);
        this.observeFormatAfterKeystroke = this.makeMergeObserable(client => client.observeFormatAfterKeystroke);
        this.observeFormatRange = this.makeMergeObserable(client => client.observeFormatRange);
        this.observeCodeformat = this.makeMergeObserable(client => client.observeCodeformat);
        this.observeAutocomplete = this.makeMergeObserable(client => client.observeAutocomplete);
        this.observeFindimplementations = this.makeMergeObserable(client => client.observeFindimplementations);
        this.observeFindsymbols = this.makeMergeObserable(client => client.observeFindsymbols);
        this.observeFindusages = this.makeMergeObserable(client => client.observeFindusages);
        this.observeGotodefinition = this.makeMergeObserable(client => client.observeGotodefinition);
        this.observeGotofile = this.makeMergeObserable(client => client.observeGotofile);
        this.observeGotoregion = this.makeMergeObserable(client => client.observeGotoregion);
        this.observeNavigateup = this.makeMergeObserable(client => client.observeNavigateup);
        this.observeNavigatedown = this.makeMergeObserable(client => client.observeNavigatedown);
        this.observeRename = this.makeMergeObserable(client => client.observeRename);
        this.observeSignatureHelp = this.makeMergeObserable(client => client.observeSignatureHelp);
        this.observeCheckalivestatus = this.makeMergeObserable(client => client.observeCheckalivestatus);
        this.observeCheckreadystatus = this.makeMergeObserable(client => client.observeCheckreadystatus);
        this.observeCurrentfilemembersastree = this.makeMergeObserable(client => client.observeCurrentfilemembersastree);
        this.observeCurrentfilemembersasflat = this.makeMergeObserable(client => client.observeCurrentfilemembersasflat);
        this.observeTypelookup = this.makeMergeObserable(client => client.observeTypelookup);
        this.observeFilesChanged = this.makeMergeObserable(client => client.observeFilesChanged);
        this.observeProjects = this.makeMergeObserable(client => client.observeProjects);
        this.observeProject = this.makeMergeObserable(client => client.observeProject);
        this.observeGetcodeactions = this.makeMergeObserable(client => client.observeGetcodeactions);
        this.observeRuncodeaction = this.makeMergeObserable(client => client.observeRuncodeaction);
        this.observeGettestcontext = this.makeMergeObserable(client => client.observeGettestcontext);
    }
}

export class CombinationClientV1<T extends ClientV1> extends CombinationClientBase<T> {
    public observeUpdatebuffer: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, any>>[]>;
    public observeChangebuffer: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, any>>[]>;
    public observeCodecheck: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.QuickFixResponse>>[]>;
    public observeFormatAfterKeystroke: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.FormatRangeResponse>>[]>;
    public observeFormatRange: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.FormatRangeRequest, OmniSharp.Models.FormatRangeResponse>>[]>;
    public observeCodeformat: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.CodeFormatResponse>>[]>;
    public observeAutocomplete: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.AutoCompleteRequest, OmniSharp.Models.AutoCompleteResponse[]>>[]>;
    public observeFindimplementations: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.QuickFixResponse>>[]>;
    public observeFindsymbols: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.FindSymbolsRequest, OmniSharp.Models.QuickFixResponse>>[]>;
    public observeFindusages: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.FindUsagesRequest, OmniSharp.Models.QuickFixResponse>>[]>;
    public observeGotodefinition: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, any>>[]>;
    public observeGotofile: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.QuickFixResponse>>[]>;
    public observeGotoregion: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.QuickFixResponse>>[]>;
    public observeNavigateup: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.NavigateResponse>>[]>;
    public observeNavigatedown: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.NavigateResponse>>[]>;
    public observeRename: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.RenameRequest, OmniSharp.Models.RenameResponse>>[]>;
    public observeSignatureHelp: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.SignatureHelp>>[]>;
    public observeCheckalivestatus: Observable<CombinationKey<OmniSharp.Context<any, boolean>>[]>;
    public observeCheckreadystatus: Observable<CombinationKey<OmniSharp.Context<any, boolean>>[]>;
    public observeCurrentfilemembersastree: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, any>>[]>;
    public observeCurrentfilemembersasflat: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, any>>[]>;
    public observeTypelookup: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.TypeLookupRequest, OmniSharp.Models.TypeLookupResponse>>[]>;
    public observeFilesChanged: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request[], boolean>>[]>;
    public observeProjects: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.WorkspaceInformationResponse, OmniSharp.Models.WorkspaceInformationResponse>>[]>;
    public observeProject: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.Request, OmniSharp.Models.ProjectInformationResponse>>[]>;
    public observeGetcodeactions: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.CodeActionRequest, OmniSharp.Models.GetCodeActionsResponse>>[]>;
    public observeRuncodeaction: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.CodeActionRequest, OmniSharp.Models.RunCodeActionResponse>>[]>;
    public observeGettestcontext: Observable<CombinationKey<OmniSharp.Context<OmniSharp.Models.TestCommandRequest, OmniSharp.Models.GetTestCommandResponse>>[]>;

    constructor(clients: T[] = []) {
        super(clients);

        this.observeUpdatebuffer = this.makeCombineObserable(client => client.observeUpdatebuffer);
        this.observeChangebuffer = this.makeCombineObserable(client => client.observeChangebuffer);
        this.observeCodecheck = this.makeCombineObserable(client => client.observeCodecheck);
        this.observeFormatAfterKeystroke = this.makeCombineObserable(client => client.observeFormatAfterKeystroke);
        this.observeFormatRange = this.makeCombineObserable(client => client.observeFormatRange);
        this.observeCodeformat = this.makeCombineObserable(client => client.observeCodeformat);
        this.observeAutocomplete = this.makeCombineObserable(client => client.observeAutocomplete);
        this.observeFindimplementations = this.makeCombineObserable(client => client.observeFindimplementations);
        this.observeFindsymbols = this.makeCombineObserable(client => client.observeFindsymbols);
        this.observeFindusages = this.makeCombineObserable(client => client.observeFindusages);
        this.observeGotodefinition = this.makeCombineObserable(client => client.observeGotodefinition);
        this.observeGotofile = this.makeCombineObserable(client => client.observeGotofile);
        this.observeGotoregion = this.makeCombineObserable(client => client.observeGotoregion);
        this.observeNavigateup = this.makeCombineObserable(client => client.observeNavigateup);
        this.observeNavigatedown = this.makeCombineObserable(client => client.observeNavigatedown);
        this.observeRename = this.makeCombineObserable(client => client.observeRename);
        this.observeSignatureHelp = this.makeCombineObserable(client => client.observeSignatureHelp);
        this.observeCheckalivestatus = this.makeCombineObserable(client => client.observeCheckalivestatus);
        this.observeCheckreadystatus = this.makeCombineObserable(client => client.observeCheckreadystatus);
        this.observeCurrentfilemembersastree = this.makeCombineObserable(client => client.observeCurrentfilemembersastree);
        this.observeCurrentfilemembersasflat = this.makeCombineObserable(client => client.observeCurrentfilemembersasflat);
        this.observeTypelookup = this.makeCombineObserable(client => client.observeTypelookup);
        this.observeFilesChanged = this.makeCombineObserable(client => client.observeFilesChanged);
        this.observeProjects = this.makeCombineObserable(client => client.observeProjects);
        this.observeProject = this.makeCombineObserable(client => client.observeProject);
        this.observeGetcodeactions = this.makeCombineObserable(client => client.observeGetcodeactions);
        this.observeRuncodeaction = this.makeCombineObserable(client => client.observeRuncodeaction);
        this.observeGettestcontext = this.makeCombineObserable(client => client.observeGettestcontext);
    }
}
