import * as React from 'react';
import { useStorage, Options as useStorageOptions } from 'react-storage-hook';
import { Map } from 'immutable';

export type expiringStorageOptions<T> = useStorageOptions<T> & {
    /**
     * The time until the record should expire in
     * milliseconds
     */
    expiresAfterMilliseconds?: number
}

export const useExpiringStorage = <T>(name: string, {
    placeholder, storageArea = window.localStorage,
    expiresAfterMilliseconds
}: expiringStorageOptions<T | undefined> = {} ):
    [Readonly<T | undefined>, (setValue: T | undefined) => void] => {
    if (!expiresAfterMilliseconds) return useStorage(name, {
        placeholder, storageArea
    });

    type storedValue = {
        /**
         * The value stored
         */
        value: T,

        /**
         * When the value expires,
         * as returned by Date.toString.
         * 
         * Placeholder values do not expire, and
         * as such have undefined expiry.
         */
        expires?: string
    }

    const [record, setRecord] = useStorage<storedValue>(
        name, {
            placeholder: placeholder?{
                value: placeholder,
            }: undefined,
            storageArea
        }
    );

    // a setTimeout callback that deletes the record
    // after some time passes
    const [destructor, setDestructor] = React.useState<
        ReturnType<typeof window.setTimeout>>();

    // when the record expiry changes
    // update the destructor callback to that time
    React.useEffect(() => {
        // if a callback exists, clear it
        if (destructor) clearInterval(destructor);
        if (!record.expires) return;

        const expiresInMilliseconds =
            (+new Date(record.expires)) - (+new Date());

        setDestructor(setTimeout(() =>
            storageArea.removeItem(name), expiresInMilliseconds));

    }, [record.expires]);

    const setStorage = React.useCallback((value: T) => {
        const expiresAt =
            new Date((expiresAfterMilliseconds + +new Date()));
  
        setRecord({
            value: value,
            expires: expiresAt.toString()
        });
    }, [setRecord]);

    return [record.value, setStorage];
}