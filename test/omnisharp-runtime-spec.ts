/// <reference path="./tsd.d.ts" />
import {expect} from "chai";
import {findRuntimeById, downloadRuntime, supportedRuntime} from "../lib/helpers/runtime";
import {Runtime} from "../lib/enums";
import {resolve} from "path";

describe("Omnisharp Runtime", function() {
    it("should get a runtime id", () => {
        return findRuntimeById("dnx-coreclr-dos-x64", resolve(__dirname, "fixture/runtimes"))
            .map(runtime => {
                expect(runtime).to.be.equal("dnx-coreclr-dos-x64.1.0.0-rc2-16389");
            })
            .toPromise();
    });

    it("should return empty if no runtime", () => {
        return findRuntimeById("dnx-coreclr-solaris-x64", resolve(__dirname, "fixture/runtimes"))
            .isEmpty()
            .map(empty => {
                expect(empty).to.be.true;
            })
            .toPromise();
    });

    xit("should download the runtimes", function() {
        this.timeout(60000);
        return downloadRuntime({
            runtime: Runtime.ClrOrMono,
            arch: process.arch,
            platform: process.platform
        }, console)
            .do(artifacts => {
                expect(artifacts[0]).to.contain("omnisharp.bootstrap-");
                expect(artifacts[1]).to.contain("omnisharp-");
            })
            .toPromise();
    });

    it("should support coreclr in an environment specific way", function() {
        return supportedRuntime({
            runtime: Runtime.CoreClr,
            arch: process.arch,
            platform: process.platform
        })
            .toPromise()
            .then(({runtime, path}) => {
                expect(runtime).to.be.equal(Runtime.CoreClr);
                expect(path).to.be.equal(process.env.PATH);
            });
    });

    it("should support mono or the clr in an environment specific way", function() {
        return supportedRuntime({
            runtime: Runtime.ClrOrMono,
            arch: process.arch,
            platform: process.platform
        })
            .toPromise()
            .then(({runtime, path}) => {
                if (process.platform === "win32") {
                    expect(Runtime[runtime]).to.be.equal(Runtime[Runtime.ClrOrMono]);
                    expect(path).to.be.equal(process.env.PATH);
                } else if (process.env.TRAVIS_MONO) {
                    expect(Runtime[runtime]).to.be.equal(Runtime[Runtime.ClrOrMono]);
                    expect(path).to.not.be.equal(process.env.PATH);
                } else {
                    expect(Runtime[runtime]).to.be.equal(Runtime[Runtime.CoreClr]);
                    expect(path).to.be.equal(process.env.PATH);
                }
            });
    });
});
