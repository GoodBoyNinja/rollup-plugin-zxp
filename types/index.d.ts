declare module 'rollup-plugin-zxp' {
    interface SelfSignedCertOptions {
        country: string;
        province: string;
        org: string;
        name: string;
        email?: string;
        output?: string;
        password: string;
    }

    interface SignOptions {
        input?: string;
        output?: string;
        cert?: string;
        password: string;
    }

    interface PluginOptions {
        overrideCert?: boolean;
        overrideZXP?: boolean;
        selfSignedCert?: SelfSignedCertOptions;
        sign?: SignOptions;
        gitIgnore?: string[];
    }

    interface RollupPluginZXP {
        (pluginOptions: PluginOptions): {
            name: string;
            writeBundle(outputOptions: any, bundle: any): Promise<void>;
        };
    }

    const rollupPluginZXP: RollupPluginZXP;

    export default rollupPluginZXP;


}
