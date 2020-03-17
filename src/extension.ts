'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AbcController } from './abc_controller'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let controller: AbcController

export function activate(context: vscode.ExtensionContext) {

    controller = new AbcController()
    context.subscriptions.push(controller)
    controller.start(context)

    /**
     * Show a preview of your abc source
     */
    context.subscriptions.push(vscode.commands.registerCommand('vscabc.showPreview', () => {
        controller.previewCurrentBuffer()
    }))

}

// this method is called when your extension is deactivated
export function deactivate() {
}