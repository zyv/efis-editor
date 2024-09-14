import { jsPDF, jsPDFOptions } from 'jspdf';
import autoTable, { CellDef, RowInput } from 'jspdf-autotable';
import {
  Checklist,
  ChecklistFile,
  ChecklistFileMetadata,
  ChecklistGroup,
  ChecklistGroup_Category,
  ChecklistItem,
  ChecklistItem_Type,
} from '../../../gen/ts/checklist';
import { PdfFonts } from './pdf-fonts';

type OrientationType = jsPDFOptions['orientation'];
type FormatType = jsPDFOptions['format'];
type AutoTabledPDF = jsPDF & { lastAutoTable: { finalY: number } };

export interface PdfWriterOptions {
  orientation?: OrientationType;
  format?: FormatType;
  outputCoverPage?: boolean;
}

export class PdfWriter {
  private static readonly DEBUG_LAYOUT = false;
  private static readonly GROUP_BOX_MARGIN = 0.4;
  private static readonly GROUP_TITLE_SIZE = 3;
  private static readonly MAIN_TITLE_FONT_SIZE = 30;
  private static readonly TITLE_TO_METADATA_SPACING = 15;
  private static readonly METADATA_HEADER_FONT_SIZE = 12;
  private static readonly METADATA_HEADER_HEIGHT = 2;
  private static readonly METADATA_VALUE_FONT_SIZE = 20;
  private static readonly METADATA_VALUE_HEIGHT = 3;
  private static readonly SPACER_CELL: CellDef = {
    content: '. '.repeat(100),
    styles: {
      overflow: 'hidden',
      valign: 'top',
      halign: 'center',
    },
  };

  private _doc?: AutoTabledPDF;
  private _fonts?: PdfFonts;
  private _pageWidth = 0;
  private _pageHeight = 0;
  private _currentY = 0;

  constructor(private _options?: PdfWriterOptions) {}

  public write(file: ChecklistFile): Blob {
    const doc = new jsPDF({
      format: this._options?.format || 'letter',
      orientation: this._options?.orientation || 'portrait',
      unit: 'em',
      putOnlyUsedFonts: true,
    });
    this._doc = doc as AutoTabledPDF;
    this._fonts = new PdfFonts(this._doc);

    this._pageHeight = this._doc.internal.pageSize.getHeight();
    this._pageWidth = this._doc.internal.pageSize.getWidth();

    this._fonts.setDefaultFont(PdfFonts.BOLD_FONT_STYLE);

    if (file.metadata && this._options?.outputCoverPage) {
      this._addCover(file.metadata);
    }
    this._addGroups(file.groups);

    return this._doc.output('blob');
  }

  private _addCover(metadata: ChecklistFileMetadata) {
    if (!this._doc) return;
    // TODO: Fill out all the metadata with a nice layout
    this._setCurrentY(this._pageHeight / 3);
    this._addCenteredText(
      'Checklists',
      PdfWriter.TITLE_TO_METADATA_SPACING,
      PdfWriter.MAIN_TITLE_FONT_SIZE,
      PdfFonts.BOLD_FONT_STYLE,
    );

    if (metadata.aircraftInfo) {
      this._addCenteredText('Aircraft:', PdfWriter.METADATA_HEADER_HEIGHT, PdfWriter.METADATA_HEADER_FONT_SIZE);
      this._addCenteredText(
        metadata.aircraftInfo,
        PdfWriter.METADATA_VALUE_HEIGHT,
        PdfWriter.METADATA_VALUE_FONT_SIZE,
        PdfFonts.BOLD_FONT_STYLE,
      );
    }
    if (metadata.makeAndModel) {
      this._addCenteredText(
        'Aircraft make/model:',
        PdfWriter.METADATA_HEADER_HEIGHT,
        PdfWriter.METADATA_HEADER_FONT_SIZE,
      );
      this._addCenteredText(
        metadata.makeAndModel,
        PdfWriter.METADATA_VALUE_HEIGHT,
        PdfWriter.METADATA_VALUE_FONT_SIZE,
        PdfFonts.BOLD_FONT_STYLE,
      );
    }
    if (metadata.manufacturerInfo) {
      this._addCenteredText('Manufacturer:', PdfWriter.METADATA_HEADER_HEIGHT, PdfWriter.METADATA_HEADER_FONT_SIZE);
      this._addCenteredText(
        metadata.manufacturerInfo,
        PdfWriter.METADATA_VALUE_HEIGHT,
        PdfWriter.METADATA_VALUE_FONT_SIZE,
        PdfFonts.BOLD_FONT_STYLE,
      );
    }
    if (metadata.copyrightInfo) {
      this._addCenteredText('Copyright:', PdfWriter.METADATA_HEADER_HEIGHT, PdfWriter.METADATA_HEADER_FONT_SIZE);
      this._addCenteredText(
        metadata.copyrightInfo,
        PdfWriter.METADATA_VALUE_HEIGHT,
        PdfWriter.METADATA_VALUE_FONT_SIZE,
        PdfFonts.BOLD_FONT_STYLE,
      );
    }

    // TODO: Add a "generated by" footer
    this._newPage();
  }

  private _addGroups(groups: ChecklistGroup[]) {
    if (!this._doc) return;

    for (const group of groups) {
      this._addGroup(group);

      // Force starting a new page for each group.
      this._newPage();
    }

    this._doc.deletePage(this._doc.internal.pages.length - 1);
  }

  private _addGroupTitle(group: ChecklistGroup) {
    if (!this._doc) return;
    if (PdfWriter.DEBUG_LAYOUT) {
      console.log(`Group ${group.title}`);
    }

    this._setCurrentY(PdfWriter.GROUP_TITLE_SIZE);
    this._addCenteredText(group.title, PdfWriter.GROUP_TITLE_SIZE, 20, PdfFonts.BOLD_FONT_STYLE);
    this._doc.saveGraphicsState();

    let rectColor = 'black';
    if (group.category === ChecklistGroup_Category.abnormal) {
      rectColor = 'orange';
    } else if (group.category === ChecklistGroup_Category.emergency) {
      rectColor = 'red';
    }
    this._doc.setDrawColor(rectColor);
    this._doc.rect(
      PdfWriter.GROUP_BOX_MARGIN,
      PdfWriter.GROUP_BOX_MARGIN,
      this._pageWidth - PdfWriter.GROUP_BOX_MARGIN * 2,
      PdfWriter.GROUP_TITLE_SIZE + 1,
    );
    this._doc.restoreGraphicsState();
  }

  private _addGroup(group: ChecklistGroup) {
    if (!this._doc) return;

    this._addGroupTitle(group);

    let first = true;
    for (const checklist of group.checklists) {
      if (PdfWriter.DEBUG_LAYOUT) {
        console.log(`Checklist ${checklist.title}`);
      }

      // Calculate where to start the next table.
      let startY = PdfWriter.GROUP_TITLE_SIZE * 2;
      if (!first) {
        const lastY = this._doc.lastAutoTable.finalY;
        if (lastY > this._pageHeight / 2) {
          // More than half the page is already used, start on the next page.
          this._newPage();
        } else {
          startY = lastY + 2;
        }
      }
      first = false;

      autoTable(this._doc, {
        // Actual columns are: prompt, spacer, expectation
        head: [[{ content: checklist.title, colSpan: 3, styles: { halign: 'center', fontSize: 16 } }]],
        body: this._checklistTableBody(checklist),
        showHead: 'firstPage',
        startY: startY,
        rowPageBreak: 'avoid',
        styles: PdfWriter.DEBUG_LAYOUT
          ? {
              lineWidth: 0.1,
            }
          : undefined,
      });
    }
  }

  private _checklistTableBody(checklist: Checklist): RowInput[] {
    return checklist.items.map((item: ChecklistItem) => {
      return this._itemToCells(item);
    });
  }

  private _itemToCells(item: ChecklistItem): CellDef[] {
    if (!this._doc) return [];

    const cells: CellDef[] = [];
    const prompt: CellDef = {
      content: item.prompt,
      styles: {
        halign: 'left',
        valign: 'top',
        minCellWidth: 10,
      },
    };

    // We should be able to have the prefix in its own cell and have non-prefixed rows use a colSpan=2 for the prompt,
    // but unfortunately a bug in jspdf-autotable prevents that:
    // https://github.com/simonbengtsson/jsPDF-AutoTable/issues/686
    switch (item.type) {
      case ChecklistItem_Type.ITEM_TITLE:
        prompt.styles!.fontStyle = PdfFonts.BOLD_FONT_STYLE;
        break;
      case ChecklistItem_Type.ITEM_SPACE:
        // TODO: Skip alternating styles for blanks?
        prompt.styles!.minCellHeight = 2;
        break;
      case ChecklistItem_Type.ITEM_WARNING:
        // TODO: Icon
        prompt.content = 'WARNING: ' + prompt.content;
        break;
      case ChecklistItem_Type.ITEM_CAUTION:
        // TODO: Icon
        prompt.content = 'CAUTION: ' + prompt.content;
        break;
      case ChecklistItem_Type.ITEM_NOTE:
        prompt.content = 'NOTE: ' + prompt.content;
        break;
    }

    if (item.centered) {
      prompt.styles!.halign = 'center';
    } else if (item.indent) {
      const defaultPadding = 5 / this._doc.internal.scaleFactor;
      prompt.styles!.cellPadding = {
        left: item.indent + defaultPadding,
        // Specifying any cellPadding removes the other default paddings, so must specify all of them.
        top: defaultPadding,
        bottom: defaultPadding,
        right: defaultPadding,
      };
    }

    if (item.type === ChecklistItem_Type.ITEM_CHALLENGE_RESPONSE) {
      const expectation: CellDef = {
        content: item.expectation,
        styles: {
          halign: 'left',
          valign: 'top',
        },
      };
      cells.push(prompt, PdfWriter.SPACER_CELL, expectation);
    } else {
      prompt.colSpan = 3;
      cells.push(prompt);
    }

    if (PdfWriter.DEBUG_LAYOUT) {
      console.log(cells);
    }

    return cells;
  }

  private _setCurrentY(y: number) {
    this._currentY = y;
  }

  private _newPage() {
    this._doc?.addPage();
    this._setCurrentY(0);
  }

  private _addCenteredText(txt: string, advanceY: number, fontSize?: number, fontStyle?: string) {
    if (!this._doc) return;

    this._doc.saveGraphicsState();
    if (fontSize) {
      this._doc.setFontSize(fontSize);
    }
    this._fonts!.setDefaultFont(fontStyle);
    this._doc.text(txt, this._pageWidth / 2, this._currentY, { align: 'center' });
    this._doc.restoreGraphicsState();

    this._currentY += advanceY;
  }
}
