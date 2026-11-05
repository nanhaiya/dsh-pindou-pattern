using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace BeadPatternStudio
{
    internal static class Program
    {
        private const string AppTitle = "拼豆图纸工坊 · Bead Pattern Studio";

        [DllImport("kernel32", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern bool SetDllDirectory(string path);

        [STAThread]
        private static void Main()
        {
            // Resolve the managed WebView2 SDK assemblies out of our own resources
            // so the program ships as a single .exe.
            AppDomain.CurrentDomain.AssemblyResolve += ResolveManaged;
            string appDir = PrepareAppDir();
            try
            {
                SetDllDirectory(appDir);
            }
            catch (Exception)
            {
            }
            Run(appDir);
        }

        [MethodImpl(MethodImplOptions.NoInlining)]
        private static void Run(string appDir)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string page = Path.Combine(appDir, "index.html");

            Form form = new Form();
            form.Text = AppTitle;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.ClientSize = new Size(1280, 840);
            form.MinimumSize = new Size(900, 620);
            form.BackColor = Color.FromArgb(250, 247, 240);
            try
            {
                form.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            }
            catch (Exception)
            {
            }

            WebView2 web = new WebView2();
            web.Dock = DockStyle.Fill;
            form.Controls.Add(web);

            bool booted = false;
            form.Shown += delegate
            {
                if (booted)
                {
                    return;
                }
                booted = true;
                Boot(web, form, appDir, page);
            };

            Application.Run(form);
        }

        private static string PrepareAppDir()
        {
            string appDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "BeadPatternStudio");
            Directory.CreateDirectory(appDir);

            WriteResource("index.html", Path.Combine(appDir, "index.html"));
            WriteResource("WebView2Loader.dll", Path.Combine(appDir, "WebView2Loader.dll"));
            return appDir;
        }

        private static void WriteResource(string name, string target)
        {
            try
            {
                Assembly asm = Assembly.GetExecutingAssembly();
                using (Stream stream = asm.GetManifestResourceStream(name))
                {
                    if (stream == null)
                    {
                        return;
                    }
                    using (FileStream file = File.Create(target))
                    {
                        stream.CopyTo(file);
                    }
                }
            }
            catch (Exception)
            {
            }
        }

        private static Assembly ResolveManaged(object sender, ResolveEventArgs args)
        {
            try
            {
                string simple = new AssemblyName(args.Name).Name;
                if (simple != "Microsoft.Web.WebView2.Core" && simple != "Microsoft.Web.WebView2.WinForms")
                {
                    return null;
                }
                Assembly asm = Assembly.GetExecutingAssembly();
                using (Stream stream = asm.GetManifestResourceStream(simple + ".dll"))
                {
                    if (stream == null)
                    {
                        return null;
                    }
                    byte[] data = new byte[stream.Length];
                    stream.Read(data, 0, data.Length);
                    return Assembly.Load(data);
                }
            }
            catch (Exception)
            {
                return null;
            }
        }

        private static async void Boot(WebView2 web, Form form, string appDir, string page)
        {
            try
            {
                CoreWebView2Environment environment = await CoreWebView2Environment.CreateAsync(
                    null,
                    Path.Combine(appDir, "userdata"));
                await web.EnsureCoreWebView2Async(environment);

                CoreWebView2 core = web.CoreWebView2;
                core.SetVirtualHostNameToFolderMapping(
                    "pindou.local",
                    appDir,
                    CoreWebView2HostResourceAccessKind.Allow);
                core.DownloadStarting += OnDownloadStarting;
                core.Settings.AreDefaultContextMenusEnabled = true;
                core.Settings.IsStatusBarEnabled = false;

                web.Source = new Uri("https://pindou.local/index.html");
            }
            catch (Exception error)
            {
                DialogResult answer = MessageBox.Show(
                    "无法启动内置浏览器（WebView2 运行时缺失或初始化失败）。\n\n" +
                    "是否改用系统默认浏览器打开？\n\n" + error.Message,
                    AppTitle,
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Warning);
                if (answer == DialogResult.Yes && File.Exists(page))
                {
                    try
                    {
                        Process.Start(page);
                    }
                    catch (Exception)
                    {
                    }
                }
                form.Close();
            }
        }

        private static void OnDownloadStarting(object sender, CoreWebView2DownloadStartingEventArgs e)
        {
            try
            {
                string name = Path.GetFileName(e.ResultFilePath);
                if (string.IsNullOrEmpty(name) || name.IndexOf('.') < 0)
                {
                    name = "pindou-pattern.png";
                }
                string downloads = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                    "Downloads");
                Directory.CreateDirectory(downloads);
                e.ResultFilePath = UniquePath(downloads, name);
            }
            catch (Exception)
            {
            }
            // Keep the standard save dialog, now pre-filled with a readable name.
            e.Handled = false;
        }

        private static string UniquePath(string directory, string fileName)
        {
            string candidate = Path.Combine(directory, fileName);
            if (!File.Exists(candidate))
            {
                return candidate;
            }
            string stem = Path.GetFileNameWithoutExtension(fileName);
            string extension = Path.GetExtension(fileName);
            for (int index = 2; index < 1000; index++)
            {
                candidate = Path.Combine(directory, stem + " (" + index + ")" + extension);
                if (!File.Exists(candidate))
                {
                    return candidate;
                }
            }
            return Path.Combine(directory, fileName);
        }
    }
}
