// utils/validateFileSizeField.ts

import { Field } from "payload"

export const filesizeLimited = (maxMB: number): Field => ({
  name: 'filesize',
  type: 'number',
  admin: {
    readOnly: true,
    disabled: true,
  },
  validate: (value: number | null | undefined) => {
    if (typeof value !== 'number') return true;
    if (value > maxMB * 1024 * 1024) {
      return `File size too large. Maximum allowed is ${maxMB} MB.`
    }
    return true
  },
})
