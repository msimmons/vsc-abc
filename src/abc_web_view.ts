import * as vscode from 'vscode'
import * as PathHelper from 'path'
import * as fs from 'fs'

export class AbcWebView implements vscode.Disposable {

    context: vscode.ExtensionContext
    htmlTemplate: string
    private disposables: vscode.Disposable[] = []

    constructor(context: vscode.ExtensionContext) {
        this.context = context
        let htmlPath = PathHelper.join(context.extensionPath, 'resources/abcjs.html')
        this.htmlTemplate = fs.readFileSync(htmlPath).toString()
    }

    dispose() {
        this.disposables.forEach(d => d.dispose())
    }

    private panelMap:  Map<string, vscode.WebviewPanel> = new Map<string, vscode.WebviewPanel>()

    update(doc: vscode.TextDocument) {
        if (this.panelMap.has(doc.uri.path)) {
            let panel = this.panelMap.get(doc.uri.path)
            panel.webview.html = this.getHtml(panel)
            panel.webview.postMessage({command: 'render', source: doc.getText(), params: {responsive: 'resize'}})
        }
        else this.create(doc)
    }

    private processMessage(doc: vscode.TextDocument) {
        return (message) => {
            let ed = vscode.window.visibleTextEditors.find(e => e.document === doc)
            if (ed) {
                let anchor = doc.positionAt(message.startChar)
                let end = doc.positionAt(message.endChar)
                ed.selection = new vscode.Selection(anchor, end)
            }
        }
    }

    private changeState = (event: vscode.WebviewPanelOnDidChangeViewStateEvent) => {
        console.log(event)
    }

    create(doc: vscode.TextDocument) {
        let panel = vscode.window.createWebviewPanel('vsc-abc.preview', `${doc.uri.path}.preview`, { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true}, {
            enableScripts: true,
            retainContextWhenHidden: false,
            enableFindWidget: false
        })
        this.disposables.push(panel.onDidDispose(() => { this.panelMap.delete(doc.uri.path)}))
        this.disposables.push(panel.webview.onDidReceiveMessage(this.processMessage(doc)))
        this.disposables.push(panel.onDidChangeViewState(this.changeState))
        this.panelMap.set(doc.uri.path, panel)
        panel.webview.html = this.getHtml(panel)
        panel.webview.postMessage({command: 'render', source: doc.getText(), params: {responsive: 'resize'}})
    }

    show(uri: vscode.Uri) {
        if (this.panelMap.has(uri.path)) {
            this.panelMap.get(uri.path).reveal()
        }
    }

    close(uri: vscode.Uri) {
        if (this.panelMap.has(uri.path)) {
            let panel = this.panelMap.get(uri.path)
            this.panelMap.delete(uri.path)
            panel.dispose()
        }
    }

    public getHtml(panel: vscode.WebviewPanel) : string {
        let localPath = vscode.Uri.file(PathHelper.join(this.context.extensionPath, 'resources/abcjs.min.js'))
        let localUri = panel.webview.asWebviewUri(localPath)
        let panelHtml = this.htmlTemplate.replace('${abcjs.uri}', localUri.toString())
        return panelHtml
    }

}