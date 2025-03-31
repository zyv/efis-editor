import { DYNON_FORMAT_OPTIONS } from './dynon-format';
import { FormatId } from './format-id';
import { EXPECTED_CONTENTS } from './test-data';
import { loadFile } from './test-utils';
import { TextReader } from './text-reader';
import { TextWriter } from './text-writer';
import { FORMAT_REGISTRY } from './format-registry';

export const DYNON_EXPECTED_CONTENTS = new TextReader(new File([], 'fake'), DYNON_FORMAT_OPTIONS).testCaseify(
  EXPECTED_CONTENTS,
);

describe('DynonFormat', () => {
  beforeAll(() => {
    TextWriter.testingTime = new Date(2024, 4, 3);
  });

  describe('read then write back test file', () => {
    it('with no wrapping', async () => {
      await testWriteRead('test-dynon.txt', FormatId.DYNON);
    });

    it('with 31-column wrapping', async () => {
      await testWriteRead('test-dynon31.txt', FormatId.DYNON31);
    });

    it('with 40-column wrapping', async () => {
      await testWriteRead('test-dynon40.txt', FormatId.DYNON40);
    });
  });

  async function testWriteRead(fileName: string, formatId: FormatId): Promise<void> {
    const readFormat = FORMAT_REGISTRY.getFormat(FormatId.DYNON);

    const f = await loadFile('/model/formats/' + fileName, 'test.txt');
    const readFile = await readFormat.toProto(f);
    expect(readFile).toEqual(DYNON_EXPECTED_CONTENTS);

    // Now write the file back.
    const decoder = new TextDecoder('UTF-8');
    const writeFormat = FORMAT_REGISTRY.getFormat(formatId);
    const writtenFile = await writeFormat.fromProto(readFile);
    const writtenData = decoder.decode(await writtenFile.arrayBuffer());
    const writtenLines = writtenData.split('\r\n');
    const readData = decoder.decode(await f.arrayBuffer());
    const readLines = readData.split('\r\n');
    expect(writtenLines).toEqual(readLines);
  }
});
