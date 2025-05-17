import win32gui

def get_visible_window_titles():
    titles = []

    def enum_handlr(hwnd, _):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)
            if title:
                titles.append(title)

    win32gui.EnumWindows(enum_handlr, None)
    return titles

apps = get_visible_window_titles()
print("Open Applications with Visible Windows:")
for app in apps:
    print(app)