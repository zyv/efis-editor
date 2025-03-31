import { FormatId } from './format-id';
import { GRT_FORMAT_OPTIONS } from './grt-format';
import { EXPECTED_CONTENTS } from './test-data';
import { loadFile } from './test-utils';
import { TextReader } from './text-reader';
import { TextWriter } from './text-writer';
import { FORMAT_REGISTRY } from './format-registry';

export const GRT_EXPECTED_CONTENTS = new TextReader(new File([], 'fake'), GRT_FORMAT_OPTIONS).testCaseify(
  EXPECTED_CONTENTS,
);

describe('GrtFormat', () => {
  beforeAll(() => {
    TextWriter.testingTime = new Date(2024, 4, 3);
  });

  it('read then write back test file', async () => {
    // Read file and check the proto contents.
    const f = await loadFile('/model/formats/test-grt.txt', 'test.txt');
    const readFile = await FORMAT_REGISTRY.getFormat(FormatId.GRT).toProto(f);
    expect(readFile).toEqual(GRT_EXPECTED_CONTENTS);

    // Now write the file back.
    const decoder = new TextDecoder('UTF-8');
    const writtenFile = await FORMAT_REGISTRY.getFormat(FormatId.GRT).fromProto(readFile);
    const writtenData = decoder.decode(await writtenFile.arrayBuffer());
    const writtenLines = writtenData.split('\r\n');
    const readData = decoder.decode(await f.arrayBuffer());
    const readLines = readData.split('\r\n');
    expect(writtenLines).toEqual(readLines);
  });
});
