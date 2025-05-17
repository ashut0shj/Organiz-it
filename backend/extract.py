import win32gui

def get_vscode_file():
    def enum_windows(hwnd, result):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetPath(hwnd)
            result.append(title)
        print(result)
        
    result = []
    win32gui.EnumWindows(enum_windows, result)
    return result

# Run
print(get_vscode_file())
