import { BookSource } from '@/types/shelvd'

export class ShelvdUtils {
  static source: BookSource = 'shelvd'
  static coreListNames: Record<string, string> = {
    'to-read': 'To Read',
    reading: 'Reading',
    completed: 'Completed',
    dnf: 'DNF',
  }

  static createSlug = (
    input: string,
    options: Partial<{
      delimiter: string
    }> = {
      delimiter: '-',
    },
  ): string => input.toLowerCase().replace(/\s+/g, options.delimiter ?? '-')

  static printAuthorName = (
    name: string = '',
    options: Partial<{
      delimiter: string
      mandatoryNames?: string[]
    }> = {
      delimiter: ',',
      mandatoryNames: [],
    },
  ) => {
    let printName = name.trim()
    if (!printName.length) return printName

    const names = printName.split(options.delimiter ?? ',')
    const threshold = 2
    if (names.length <= threshold) return names.join(', ')

    const mandatoryNames = options?.mandatoryNames ?? []
    const mandatoryNamesSet = new Set(mandatoryNames)

    // Check if any mandatory names are present
    const hasMandatoryNames = names.some((author) =>
      mandatoryNamesSet.has(author.trim()),
    )

    // Modify the output based on the presence of mandatory names
    if (hasMandatoryNames) {
      printName = `${mandatoryNames.join(', ')}, +${names.length - mandatoryNames.length} others`
    } else {
      printName = `${names.slice(0, threshold)}, +${names.length - threshold} others`
    }
    return printName
  }
}
