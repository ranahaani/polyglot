/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as dom from '../../../../base/browser/dom.js';
import { Event } from '../../../../base/common/event.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { Range } from '../../../common/core/range.js';
import { ILanguageService } from '../../../common/languages/language.js';
import { HoverForeignElementAnchor } from '../../hover/browser/hoverTypes.js';
import { GhostTextController } from './ghostTextController.js';
import { InlineSuggestionHintsContentWidget } from './inlineSuggestionHintsWidget.js';
import { MarkdownRenderer } from '../../markdownRenderer/browser/markdownRenderer.js';
import * as nls from '../../../../nls.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
export class InlineCompletionsHover {
    constructor(owner, range, controller) {
        this.owner = owner;
        this.range = range;
        this.controller = controller;
    }
    isValidForHoverAnchor(anchor) {
        return (anchor.type === 1 /* HoverAnchorType.Range */
            && this.range.startColumn <= anchor.range.startColumn
            && this.range.endColumn >= anchor.range.endColumn);
    }
    requestExplicitContext() {
        var _a, _b, _c;
        (_c = (_b = (_a = this.controller.activeModel) === null || _a === void 0 ? void 0 : _a.activeInlineCompletionsModel) === null || _b === void 0 ? void 0 : _b.completionSession.value) === null || _c === void 0 ? void 0 : _c.ensureUpdateWithExplicitContext();
    }
    getInlineCompletionsCount() {
        var _a, _b;
        const session = (_b = (_a = this.controller.activeModel) === null || _a === void 0 ? void 0 : _a.activeInlineCompletionsModel) === null || _b === void 0 ? void 0 : _b.completionSession.value;
        if (!(session === null || session === void 0 ? void 0 : session.hasBeenTriggeredExplicitly)) {
            return undefined;
        }
        return session === null || session === void 0 ? void 0 : session.getInlineCompletionsCountSync();
    }
    getInlineCompletionIndex() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.controller.activeModel) === null || _a === void 0 ? void 0 : _a.activeInlineCompletionsModel) === null || _b === void 0 ? void 0 : _b.completionSession.value) === null || _c === void 0 ? void 0 : _c.currentlySelectedIndex;
    }
    onDidChange(handler) {
        var _a, _b;
        const d = (_b = (_a = this.controller.activeModel) === null || _a === void 0 ? void 0 : _a.activeInlineCompletionsModel) === null || _b === void 0 ? void 0 : _b.onDidChange(handler);
        return d || Disposable.None;
    }
    get commands() {
        var _a, _b, _c;
        return ((_c = (_b = (_a = this.controller.activeModel) === null || _a === void 0 ? void 0 : _a.activeInlineCompletionsModel) === null || _b === void 0 ? void 0 : _b.completionSession.value) === null || _c === void 0 ? void 0 : _c.commands) || [];
    }
}
let InlineCompletionsHoverParticipant = class InlineCompletionsHoverParticipant {
    constructor(_editor, _languageService, _openerService, accessibilityService, _instantiationService, _telemetryService) {
        this._editor = _editor;
        this._languageService = _languageService;
        this._openerService = _openerService;
        this.accessibilityService = accessibilityService;
        this._instantiationService = _instantiationService;
        this._telemetryService = _telemetryService;
        this.hoverOrdinal = 4;
    }
    suggestHoverAnchor(mouseEvent) {
        const controller = GhostTextController.get(this._editor);
        if (!controller) {
            return null;
        }
        const target = mouseEvent.target;
        if (target.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */) {
            // handle the case where the mouse is over the view zone
            const viewZoneData = target.detail;
            if (controller.shouldShowHoverAtViewZone(viewZoneData.viewZoneId)) {
                return new HoverForeignElementAnchor(1000, this, Range.fromPositions(this._editor.getModel().validatePosition(viewZoneData.positionBefore || viewZoneData.position)), mouseEvent.event.posx, mouseEvent.event.posy, false);
            }
        }
        if (target.type === 7 /* MouseTargetType.CONTENT_EMPTY */) {
            // handle the case where the mouse is over the empty portion of a line following ghost text
            if (controller.shouldShowHoverAt(target.range)) {
                return new HoverForeignElementAnchor(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
            }
        }
        if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
            // handle the case where the mouse is directly over ghost text
            const mightBeForeignElement = target.detail.mightBeForeignElement;
            if (mightBeForeignElement && controller.shouldShowHoverAt(target.range)) {
                return new HoverForeignElementAnchor(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
            }
        }
        return null;
    }
    computeSync(anchor, lineDecorations) {
        if (this._editor.getOption(60 /* EditorOption.inlineSuggest */).showToolbar === 'always') {
            return [];
        }
        const controller = GhostTextController.get(this._editor);
        if (controller && controller.shouldShowHoverAt(anchor.range)) {
            return [new InlineCompletionsHover(this, anchor.range, controller)];
        }
        return [];
    }
    renderHoverParts(context, hoverParts) {
        const disposableStore = new DisposableStore();
        const part = hoverParts[0];
        this._telemetryService.publicLog2('inlineCompletionHover.shown');
        if (this.accessibilityService.isScreenReaderOptimized()) {
            this.renderScreenReaderText(context, part, disposableStore);
        }
        const w = this._instantiationService.createInstance(InlineSuggestionHintsContentWidget, this._editor, false);
        context.fragment.appendChild(w.getDomNode());
        w.update(null, part.getInlineCompletionIndex() || 0, part.getInlineCompletionsCount(), part.commands);
        part.requestExplicitContext();
        disposableStore.add(part.onDidChange(() => {
            w.update(null, part.getInlineCompletionIndex() || 0, part.getInlineCompletionsCount(), part.commands);
        }));
        return disposableStore;
    }
    renderScreenReaderText(context, part, disposableStore) {
        const $ = dom.$;
        const markdownHoverElement = $('div.hover-row.markdown-hover');
        const hoverContentsElement = dom.append(markdownHoverElement, $('div.hover-contents', { ['aria-live']: 'assertive' }));
        const renderer = disposableStore.add(new MarkdownRenderer({ editor: this._editor }, this._languageService, this._openerService));
        const render = (code) => {
            disposableStore.add(renderer.onDidRenderAsync(() => {
                hoverContentsElement.className = 'hover-contents code-hover-contents';
                context.onContentsChanged();
            }));
            const inlineSuggestionAvailable = nls.localize('inlineSuggestionFollows', "Suggestion:");
            const renderedContents = disposableStore.add(renderer.render(new MarkdownString().appendText(inlineSuggestionAvailable).appendCodeblock('text', code)));
            hoverContentsElement.replaceChildren(renderedContents.element);
        };
        disposableStore.add(Event.runAndSubscribe(e => part.onDidChange(e), () => {
            var _a, _b;
            const ghostText = (_b = (_a = part.controller.activeModel) === null || _a === void 0 ? void 0 : _a.inlineCompletionsModel) === null || _b === void 0 ? void 0 : _b.ghostText;
            if (ghostText) {
                const lineText = this._editor.getModel().getLineContent(ghostText.lineNumber);
                render(ghostText.renderForScreenReader(lineText));
            }
            else {
                dom.reset(hoverContentsElement);
            }
        }));
        context.fragment.appendChild(markdownHoverElement);
    }
};
InlineCompletionsHoverParticipant = __decorate([
    __param(1, ILanguageService),
    __param(2, IOpenerService),
    __param(3, IAccessibilityService),
    __param(4, IInstantiationService),
    __param(5, ITelemetryService)
], InlineCompletionsHoverParticipant);
export { InlineCompletionsHoverParticipant };
