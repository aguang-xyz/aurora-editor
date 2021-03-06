import Path from "path";
import React from "react";

import IpcEvent from "../../ipc/IpcEvent";
import IpcProxy from "../../ipc/IpcProxy";

import MdEditor from "./MdEditor";
import MdViewer from "./MdViewer";

import { getSetting, setSetting } from "../libs/Settings";

class MarkdownEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      path: null,

      savedContent: "",
      editingContent: "",

      saved: true,

      theme: "light",
    };

    this.mdEditorRef = React.createRef();
  }

  componentDidMount() {

    getSetting('theme', 'light')
      .then(theme => this.setState({ theme }));

    document.addEventListener("keydown", (e) => {
      console.log(e.which, e.shiftKey);

      // Ctrl+N: New markdown.
      if (e.ctrlKey && e.which === 78) {
        IpcProxy.send(IpcEvent.NEW_MARKDOWN);
      }

      // Ctrl+O: Open markdown.
      if (e.ctrlKey && e.which === 79) {
        IpcProxy.send(IpcEvent.OPEN_MARKDOWN);
      }

      // Ctrl+S: Save markdown.
      if (e.ctrlKey && e.which === 83) {
        IpcProxy.send(IpcEvent.SAVE_MARKDOWN);
      }

      // Shift+Ctrl+S: Save as markdown.
      if (e.shiftKey && e.ctrlKey && e.which === 83) {
        IpcProxy.send(IpcEvent.SAVE_AS_MARKDOWN);
      }

      // Ctrl+Q: Quit.
      if (e.ctrlKey && e.which === 81) {
        IpcProxy.send(IpcEvent.QUIT);
      }

      // Ctrl+F: toggle fullscreen.
      if (e.ctrlKey && e.which === 70) {
        IpcProxy.send(IpcEvent.TOGGLE_FULLSCREEN);
      }

      // ESC: turn off fullscreen.
      if (e.which === 27) {
        IpcProxy.send(IpcEvent.SET_FULLSCREEN, false);
      }
    });

    // Response for getting editor status.
    IpcProxy.on(IpcEvent.GET_EDITOR_STATUS, () => {
      console.log(`Event: GET_EDITOR_STATUS`);

      const { path, savedContent, editingContent, saved, theme } = this.state;

      const title = this.getTitle();

      const rightPanelDOM = document.getElementsByClassName("RightPanel")[0];
      const previewWidth = rightPanelDOM.clientWidth;
      const previewHeight = rightPanelDOM.clientHeight;

      IpcProxy.send(IpcEvent.GET_EDITOR_STATUS_REPLY, {
        path,
        savedContent,
        editingContent,
        saved,
        theme,
        title,
        previewWidth,
        previewHeight,
      });
    });

    // Response for setting editor status.
    IpcProxy.on(IpcEvent.SET_EDITOR_STATUS, (e, arg) => {
      console.log(`Event: SET_EDITOR_STATUS`, arg);

      const { path, content, theme } = arg;

      if (content !== undefined) {
        if (this.state.editingContent != content) {
          this.mdEditorRef && this.mdEditorRef.current.setValue(content);
        }
      }

      if (theme) {
        setSetting('theme', theme);
      }

      this.setState({
        path: path !== undefined ? path : this.state.path,
        savedContent: content !== undefined ? content : this.state.savedContent,
        editingContent:
          content !== undefined ? content : this.state.editingContent,
        saved: content !== undefined ? true : this.state.saved,
        theme: theme || this.state.theme,
      });
    });

    // Notify the main thread, view rendering is ready.
    IpcProxy.send(IpcEvent.READY, {});
  }

  getTitle() {
    const name = this.state.path
      ? Path.parse(this.state.path).base
      : "Untitled";

    return this.state.saved ? name : `${name} (*)`;
  }

  onContentChange(editingContent) {
    const saved = editingContent === this.state.savedContent;

    this.setState({
      editingContent,
      saved,
    });
  }

  render() {
    if (window.AuroraProps) {
      const { path, content, theme } = window.AuroraProps;

      return (
        <div className={`Container ${theme} Exported`}>
          <div className="RightPanel">
            <MdViewer path={path} content={content} theme={theme} />
          </div>
        </div>
      );
    }

    return (
      <div className={`Container ${this.state.theme}`}>
        <title>{this.getTitle()}</title>
        <div className="LeftPanel">
          <MdEditor
            ref={this.mdEditorRef}
            defaultValue={this.state.editingContent}
            onChange={this.onContentChange.bind(this)}
            theme={this.state.theme}
          />
        </div>
        <div className="RightPanel">
          <MdViewer
            path={this.state.path}
            content={this.state.editingContent}
            theme={this.state.theme}
          />
        </div>{" "}
      </div>
    );
  }
}

export default MarkdownEditor;
