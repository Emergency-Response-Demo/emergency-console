/**
 * An enum representing the CloudEvent specification version
 */
export const enum Version {
    V1 = "1.0",
    V03 = "0.3"
}

export class CloudEvent {
    id: string;
    type: string;
    source: string;
    specversion: Version;
    datacontenttype?: string;
    dataschema?: string;
    subject?: string;
    time?: string;
    _data?: Record<string, unknown | string | number | boolean> | string | number | boolean | null | unknown;
    data_base64?: string;

    [key: string]: unknown;

    get data(): unknown {
        return this._data;
    }

    toJSON(): Record<string, unknown> {
        const event = { ...this };
        event.time = new Date(this.time as string).toISOString();
        event._data = !this.isBinary(this._data) ? this._data : undefined;
        return event;
    }

    toString(): string {
        return JSON.stringify(this);
    }

    isBinary = (v: unknown): boolean => v instanceof Uint32Array;
}