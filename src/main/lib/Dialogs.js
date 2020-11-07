import { dialog } from "electron";

export async function displayWarning(message) {
  return (
    await dialog.showMessageBox({
      type: "warning",
      message: message,
      buttons: ["Ok"],
    })
  ).response;
}

export async function confirmToSave(path) {
  return (
    await dialog.showMessageBox({
      type: "warning",
      message: `Save changes before closing ${path || "Utitled file"}?`,
      buttons: ["Close without saving", "Cancel", "Save"],
    })
  ).response;
}

export async function choosePathToSave() {
  return (
    await dialog.showSaveDialog({
      filters: [
        {
          name: "Markdown",
          extensions: ["md"],
        },
      ],
    })
  ).filePath;
}

export async function choosePathToSaveHtml() {
  return (
    await dialog.showSaveDialog({
      filters: [
        {
          name: "HTML",
          extensions: ["html"],
        },
      ],
    })
  ).filePath;
}

export async function choosePathToSavePng() {
  return (
    await dialog.showSaveDialog({
      filters: [
        {
          name: "PNG",
          extensions: ["png"],
        },
      ],
    })
  ).filePath;
}

export async function choosePathToOpen() {
  return (
    await dialog.showOpenDialog({
      title: "Open Markdown",
      filters: [
        {
          name: "Markdown",
          extensions: ["md"],
        },
      ],
    })
  ).filePaths[0];
}
