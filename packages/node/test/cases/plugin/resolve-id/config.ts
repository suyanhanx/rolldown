import type { RollupOptions, RollupOutput } from '@rolldown/node'
import { expect, vi } from 'vitest'
import path from 'path'

const entry = path.join(__dirname, './main.js')

const resolveIdFn = vi.fn()

const config: RollupOptions = {
  input: entry,
  plugins: [
    {
      name: 'test-plugin',
      resolveId: function (id, importer, options) {
        resolveIdFn()
        if (id === 'external') {
          expect(importer).toStrictEqual(entry)
          expect(options).toMatchObject({
            isEntry: false,
            kind: 'require-call',
          })
          return {
            id,
            external: true,
          }
        }
        if (id === './foo') {
          expect(importer).toStrictEqual(entry)
          expect(options).toMatchObject({
            isEntry: false,
            kind: 'import-statement',
          })
          return {
            id: path.join(__dirname, './foo.js'),
            external: false,
          }
        }
        // TODO: external dynamic import will loop
        // if (id === 'dynamic') {
        //   expect(importer).toStrictEqual(entry)
        //   expect(options).toMatchObject({
        //     isEntry: false,
        //     kind: 'dynamic-import'
        //   })
        //   return {
        //     id,
        //     external: true
        //   }
        // }
        if (id === entry) {
          expect(importer).toBeUndefined()
          expect(options).toMatchObject({
            isEntry: true,
            kind: 'import-statement',
          })
        }
      },
    },
  ],
}

export default {
  config,
  afterTest: (output: RollupOutput) => {
    expect(resolveIdFn).toHaveBeenCalledTimes(3)
  },
}
