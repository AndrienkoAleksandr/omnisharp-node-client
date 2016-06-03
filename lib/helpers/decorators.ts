import * as OmniSharp from "../omnisharp-server";
import _ from "lodash";
import {Subject, Observable} from "rxjs";
import {ResponseContext} from "../contexts";

export function getInternalKey(path: string) {
    return `__${path}__`;
}

export function getInternalValue(context: any, path: string) {
    const instance = context._client || context;
    return instance[getInternalKey(path)];
}

export function setEventOrResponse(context: any, path: string) {
    const instance = context._client || context;
    const isEvent = _.startsWith(path, "/");
    const internalKey = getInternalKey(path);
    if (isEvent) {
        const eventKey = path[0].toUpperCase() + path.substr(1);
        instance[internalKey] = (<Observable<OmniSharp.Stdio.Protocol.EventPacket>>instance._eventsStream)
            .filter(x => x.Event === eventKey)
            .map(x => x.Body)
            .share();
    } else {
        const stream: Subject<ResponseContext<any, any>> = instance._getResponseStream(path);
        instance[internalKey] = stream.asObservable()
            .filter(x => !x.silent);
    }
    return instance[internalKey];
}

export function request(target: Object, propertyKey: string) {
    const descriptor: TypedPropertyDescriptor<any> = {};
    const version = OmniSharp.Api.getVersion(propertyKey);
    let format = (name: string) => `/${name}`;
    if (version !== "v1") {
        format = (name) => `/${version}/${name}`;
    }

    const name = format(propertyKey);
    descriptor.value = function (request: OmniSharp.Models.Request, options: any) {
        if ((<any>request).silent) {
            options = request;
            request = {};
        }
        request = request || {};

        this._fixup(propertyKey, request, options);
        return this.request(name, request, options);
    };
    descriptor.enumerable = true;
    Object.defineProperty(target, propertyKey, descriptor);
}

export function response(target: Object, propertyKey: string, path: string) {
    const descriptor: TypedPropertyDescriptor<any> = {};
    const internalKey = getInternalKey(path);
    descriptor.get = function () {
        if (!this[internalKey]) {
            setEventOrResponse(this, path);
        }

        return this[internalKey];
    };
    descriptor.enumerable = true;
    Object.defineProperty(target, propertyKey, descriptor);
}

export function event(target: Object, path: string) {
    const descriptor: TypedPropertyDescriptor<any> = {};
    const internalKey = getInternalKey(path);
    descriptor.get = function () {
        if (!this[internalKey]) {
            setEventOrResponse(this, path);
        }

        return this[internalKey];
    };
    descriptor.enumerable = true;
    Object.defineProperty(target, path, descriptor);
}

export function merge(target: Object, propertyKey: string, path: string) {
    const descriptor: TypedPropertyDescriptor<any> = {};
    const internalKey = getInternalKey(path);
    const method = (c: any) => c.observe[propertyKey] || c[propertyKey];
    descriptor.get = function () {
        if (!this[internalKey]) {
            const value = this.makeMergeObserable(method);
            this[internalKey] = value;
        }
        return this[internalKey];
    };
    descriptor.enumerable = true;
    Object.defineProperty(target, propertyKey, descriptor);
}

export function aggregate(target: Object, propertyKey: string, path: string) {
    const descriptor: TypedPropertyDescriptor<any> = {};
    const internalKey = getInternalKey(path);
    const method = (c: any) => c.observe[propertyKey] || c[propertyKey];
    descriptor.get = function () {
        if (!this[internalKey]) {
            const value = this.makeAggregateObserable(method);
            this[internalKey] = value;
        }
        return this[internalKey];
    };
    descriptor.enumerable = true;
    Object.defineProperty(target, propertyKey, descriptor);
}

export function reference(target: Object, propertyKey: string, path: string) {
    const descriptor: TypedPropertyDescriptor<any> = {};
    descriptor.get = function () { return this._client[propertyKey]; };
    Object.defineProperty(target, propertyKey, descriptor);
}
