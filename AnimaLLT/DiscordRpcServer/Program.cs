using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using DiscordRPC;
using DiscordRPC.Logging;
using Newtonsoft.Json;

namespace OverwolfDiscordRPC
{
    class PresenceUpdate
    {
        public string Details { get; set; }
        public string State   { get; set; }
        public string LargeImageKey  { get; set; }
        public string LargeImageText { get; set; }
        public string SmallImageKey  { get; set; }
        public string SmallImageText { get; set; }
    }

    class Program
    {
        // Your Discord App’s client ID
        const string CLIENT_ID = "1370757783468769360";
        // HTTP port for local updates
        const int    PORT      = 30120;

        static DiscordRpcClient client;

        static async Task Main(string[] args)
        {
            // Handle Ctrl+C to shut down cleanly
            using var cts = new CancellationTokenSource();
            Console.CancelKeyPress += (_, e) =>
            {
                e.Cancel = true;
                cts.Cancel();
            };

            // 1. Initialize Discord client
            client = new DiscordRpcClient(CLIENT_ID)
            {
                Logger = new ConsoleLogger { Level = LogLevel.Warning }
            };

            client.OnReady += (sender, e) =>
                Console.WriteLine($"Discord RPC ready: {e.User.Username}");
            client.OnPresenceUpdate += (sender, e) =>
                Console.WriteLine("Presence updated");

            client.Initialize();
            Console.WriteLine("RPC server running on port " + PORT);

            // 2. Start HTTP listener
            var listener = new HttpListener();
            listener.Prefixes.Add($"http://127.0.0.1:{PORT}/");
            listener.Start();

            // 3. Async listen loop
            try
            {
                while (!cts.Token.IsCancellationRequested)
                {
                    var ctx = await listener.GetContextAsync().ConfigureAwait(false);
                    _ = Task.Run(() => HandleRequest(ctx), cts.Token);
                }
            }
            catch (HttpListenerException) when (cts.IsCancellationRequested)
            {
                // Listener was stopped; swallow exception
            }
            finally
            {
                listener.Close();
                client.Dispose();
                Console.WriteLine("RPC server stopped.");
            }
        }

        static void HandleRequest(HttpListenerContext ctx)
        {
            try
            {
                if (ctx.Request.HttpMethod == "POST" &&
                    ctx.Request.Url.AbsolutePath == "/updatePresence")
                {
                    using var reader = new System.IO.StreamReader(ctx.Request.InputStream);
                    var json = reader.ReadToEnd();
                    var update = JsonConvert.DeserializeObject<PresenceUpdate>(json);

                    client.SetPresence(new RichPresence
                    {
                        Details = update.Details,
                        State   = update.State,
                        Assets = new Assets
                        {
                            LargeImageKey  = update.LargeImageKey,
                            LargeImageText = update.LargeImageText,
                            SmallImageKey  = update.SmallImageKey,
                            SmallImageText = update.SmallImageText
                        }
                    });

                    ctx.Response.StatusCode = 204;
                }
                else
                {
                    ctx.Response.StatusCode = 404;
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                ctx.Response.StatusCode = 500;
            }
            finally
            {
                ctx.Response.OutputStream.Close();
            }
        }
    }
}
