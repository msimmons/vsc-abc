import * as vscode from 'vscode'
import * as fs from 'fs'
import { AbcWebView } from './abc_web_view'
import * as PathHelper from 'path'

export class AbcController implements vscode.Disposable {

    private view: AbcWebView
    private autoPreview = true
    private disposables: vscode.Disposable[] = []

    private documentOpened() {
        return  (doc: vscode.TextDocument) => {
            if (this.autoPreview) this.preview(doc)
            else this.view.show(doc.uri)
        }
    }

    private documentClosed() {
        return (doc: vscode.TextDocument) => {
            this.view.close(doc.uri)
        }
    }

    private documentChanged() {
        return (event: vscode.TextDocumentChangeEvent) => {
            if (event.document.uri.path.endsWith('.abc')) {
                this.view.update(event.document)
            }
        }
    }

    start(context: vscode.ExtensionContext) {
        this.view = new AbcWebView(context)
        this.disposables.push(this.view)
        this.registerListeners()
    }

    dispose() {
        this.disposables.forEach(d => d.dispose())
    }

    private registerListeners() {
        this.disposables.push(vscode.workspace.onDidOpenTextDocument(this.documentOpened()))
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(this.documentChanged()))
        this.disposables.push(vscode.workspace.onDidCloseTextDocument(this.documentClosed()))
    }

    private preview(doc: vscode.TextDocument) {
        if (!doc.uri.path.endsWith('.abc')) return
        this.view.update(doc)
    }

    public async previewCurrentBuffer() {
        let document = vscode.window.activeTextEditor.document
        this.preview(document)
    }
}