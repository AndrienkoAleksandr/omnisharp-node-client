import {Observable, Scheduler} from "rx";
import {resolve, join, delimiter} from "path";
import * as fs from "fs";
import {ILogger, Runtime} from "../enums";
import {find, delay, bind, memoize, assignWith, isNull, isUndefined, toLower} from "lodash";
import {Decompress} from "./decompress";

const request: { get(url: string): NodeJS.ReadableStream; } = require("request");
const defaultServerVersion = require(resolve(__dirname, "../../package.json"))["omnisharp-roslyn"];
const exists = Observable.fromCallback(fs.exists);
const readFile = Observable.fromNodeCallback(fs.readFile);
const defaultDest = resolve(__dirname, "../../");

// Handle the case of homebrew mono
const PATH: string[] = find<string>(process.env, (v, key) => toLower(key) === "path").split(delimiter).concat(["/usr/local/bin", "/Library/Frameworks/Mono.framework/Commands"]);

export interface IRuntimeContext {
    runtime: Runtime;
    platform: string;
    arch: string;
    bootstrap?: boolean;
    version?: string;
    destination?: string;
};

export class RuntimeContext {
    private _runtime: Runtime;
    private _platform: string;
    private _arch: string;
    private _bootstrap: string;
    private _version: string;
    private _destination: string;

    private _id: string;
    private _key: string;
    private _os: string;
    private _location: string;

    constructor(runtimeContext?: IRuntimeContext, private _logger?: ILogger) {
        if (!_logger) {
            this._logger = console;
        }

        const self = <any>this;
        assignWith(self, runtimeContext || {}, (obj, src, key) => {
            self[`_${key}`] = obj || src;
        });

        if (isNull(this._runtime) || isUndefined(this._runtime)) {
            this._runtime = Runtime.ClrOrMono;
        }

        if (isNull(this._platform) || isUndefined(this._platform)) {
            this._platform = process.platform;
        }

        if (isNull(this._arch) || isUndefined(this._arch)) {
            this._arch = process.arch;
        }

        if (isNull(this._version) || isUndefined(this._version)) {
            this._version = defaultServerVersion;
        }

        this._arch = this._arch === "x86" ? "x86" : "x64";

        this._os = this._getOsName();
        this._key = this._getIdKey();
        this._id = `omnisharp-${this._key}`;

        if (isNull(this._location) || isUndefined(this._location)) {
            this._location = this._getRuntimeLocation();
        }

        if (isNull(this._destination) || isUndefined(this._destination)) {
            this._destination = resolve(defaultDest, this._id);
        }

        Object.freeze(this);
    }

    public get runtime() { return this._runtime; };
    public get platform() { return this._platform; }
    public get arch() { return this._arch; }
    public get bootstrap() { return this._bootstrap; }
    public get version() { return this._version; }
    public get destination() { return this._destination; }
    public get id() { return this._id; }
    public get location() { return this._location; }

    private _getIdKey() {
        if (this._platform !== "win32" && this._runtime === Runtime.ClrOrMono) {
            return `linux-mono`;
        }

        let runtimeName = "dnxcore50";
        if (this._runtime === Runtime.ClrOrMono) {
            if (this._platform === "win32") {
                runtimeName = "dnx451";
            } else {
                runtimeName = "mono";
            }
        }

        return `${this._os}-${this._arch}-${runtimeName}`;
    }

    private _getOsName() {
        if (this._platform === "win32")
            return "win";
        if (this._platform === "darwin")
            return "osx";
        return this._platform;
    }

    /* tslint:disable:no-string-literal */
    private _getRuntimeLocation() {
        /*if (ctx.bootstrap) {
            const bootstrap = process.platform === "win32" ? "OmniSharp.exe" : "omnisharp.bootstrap";
            return <string>process.env["OMNISHARP_BOOTSTRAP"] || resolve(__dirname, "../../", getRuntimeId(ctx), bootstrap);
        }*/

        let path: string = process.env["OMNISHARP"];

        if (!path) {
            const omnisharp = process.platform === "win32" || this._runtime === Runtime.ClrOrMono ? "OmniSharp.exe" : "OmniSharp";
            path = resolve(__dirname, "../../", this._id, omnisharp);
        }

        if (process.platform !== "win32" && this._runtime === Runtime.ClrOrMono) {
            return `mono ${path}`;
        }

        return path;
    }
    /* tslint:enable:no-string-literal */

    private _checkCurrentVersion() {
        let filename = join(this._destination, ".version");

        return exists(filename)
            .flatMap(ex => Observable.if(
                () => ex,
                Observable.defer(() => readFile(filename).map(content => content.toString().trim() === this._version)),
                Observable.just(false)
            ));
    }

    private _ensureCurrentVersion() {
        let dest = this._destination;

        return this._checkCurrentVersion()
            .flatMap(isCurrent => Observable.if(
                () => !isCurrent,
                Observable.defer(() => Observable.create<any>(observer => {
                    dest = dest || defaultDest;
                    require("rimraf")(dest, (err: any) => {
                        if (err) { observer.onError(err); return; }

                        delay(() =>
                            fs.mkdir(dest, (er) => {
                                //if (er) { observer.onError(er); return; }
                                fs.writeFile(join(dest, ".version"), this._version, (e) => {
                                    if (e) { observer.onError(e); return; }
                                    observer.onNext(isCurrent);
                                    observer.onCompleted();
                                });
                            }), 500);
                    });
                })),
                Observable.just(isCurrent)
            ));
    }

    public findRuntime(location: string = resolve(defaultDest)) {
        return findRuntimeById(this._id, location);
    }

    public downloadRuntime() {
        return Observable.defer(() => Observable.concat(
            // downloadSpecificRuntime("omnisharp.bootstrap", ctx, logger, dest),
            this._downloadSpecificRuntime("omnisharp")
        ))
            .subscribeOn(Scheduler.async)
            .toArray();
    }

    public downloadRuntimeIfMissing() {
        return this._ensureCurrentVersion()
            .flatMap((isCurrent) =>
                this.findRuntime().isEmpty())
            .flatMap(empty => Observable.if(
                () => empty,
                this.downloadRuntime()
            ));
    }

    private _downloadSpecificRuntime(name: string) {
        const filename = `${name}-${this._key}.${this._platform === "win32" ? "zip" : "tar.gz"}`;
        const destination = this._destination;
        try {
            if (!fs.existsSync(destination))
                fs.mkdirSync(destination);
        } catch (e) { /* */ }

        const url = `https://github.com/OmniSharp/omnisharp-roslyn/releases/download/${this._version}/${filename}`;
        const path = join(destination, filename);

        return Observable.defer(() => Observable.concat(
            this.downloadFile(url, path).delay(100),
            Observable.defer(() => this._extract(this._platform === "win32", path, destination))
        )
            .tapOnCompleted(() => { try { fs.unlinkSync(path); } catch (e) { /* */ } })
            .subscribeOn(Scheduler.async))
            .map(() => name);
    }

    public downloadFile(url: string, path: string) {
        this._logger.log(`Downloading ${path}`);
        return Observable.create<void>((observer) => {
            request.get(url)
                .pipe(fs.createWriteStream(path))
                .on("error", bind(observer.onError, observer))
                .on("finish", () => {
                    this._logger.log(`Finished downloading ${path}`);
                    observer.onNext(null);
                    observer.onCompleted();
                });
        });
    }

    private _extract(win32: boolean, path: string, dest: string) {
        return Observable.create<void>((observer) => {
            this._logger.log(`Extracting ${path}`);
            console.log(path, dest);
            new Decompress({ mode: "755" })
                .src(path)
                .dest(dest)
                .run((err: any, files: any) => {
                    if (err) {
                        observer.onError(err);
                        return;
                    }
                    this._logger.log(`Finished extracting ${path}`);
                    observer.onCompleted();
                });
        });
    }
}

export const isSupportedRuntime = memoize(function(ctx: RuntimeContext) {
    return Observable.defer(() => {
        // On windows we'll just use the clr, it's there
        // On mac / linux if we've picked CoreClr stick with that
        if (ctx.platform === "win32" || ctx.runtime === Runtime.CoreClr) {
            return Observable.just({ runtime: ctx.runtime, path: process.env.PATH });
        }

        // We need to check if mono exists on the system
        // If it doesn't we'll just run CoreClr
        return Observable.from(<string[]>PATH)
            .map(path => join(path, "mono"))
            .concatMap(path => exists(path).map(e => ({ exists: e, path })))
            .where(x => x.exists)
            .map(x => ({ runtime: Runtime.ClrOrMono, path: [x.path].concat(PATH).join(delimiter) }))
            .take(1)
            .defaultIfEmpty({ runtime: Runtime.CoreClr, path: process.env.PATH });
    })
        .do(ct => console.log(`Supported runtime for "${Runtime[ct.runtime]}" was: ${Runtime[ct.runtime]}`))
        .shareReplay(1);
}, function({platform, arch, runtime, version}: RuntimeContext) { return `${arch}-${platform}:${Runtime[runtime]}:${version}`; });

export function findRuntimeById(runtimeId: string, location: string): Observable<string> {
    return Observable.merge(
        exists(resolve(location, runtimeId, "OmniSharp.exe")),
        exists(resolve(location, runtimeId, "OmniSharp"))
    )
        .filter(x => x)
        .take(1)
        .map(x => resolve(location, runtimeId))
        .share();
}