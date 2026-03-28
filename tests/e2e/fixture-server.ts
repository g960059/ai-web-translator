import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface FixtureServer {
  origin: string;
  close: () => Promise<void>;
}

export async function startFixtureServer(): Promise<FixtureServer> {
  const fixturePath = resolve(
    process.cwd(),
    'tests/fixtures/wikipedia-representation-theory.html',
  );
  const fixtureHtml = await readFile(fixturePath, 'utf8');
  const lazyFixtureHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lazy Widget Fixture</title>
    <style>
      body {
        margin: 0;
        font-family: sans-serif;
      }
      main {
        max-width: 680px;
        margin: 0 auto;
        padding: 32px 20px;
      }
      .spacer {
        height: 1800px;
      }
      p {
        line-height: 1.7;
      }
    </style>
  </head>
  <body>
    <main>
      <p id="visible">Visible text.</p>
      <div class="spacer"></div>
      <p id="below">Below the fold.</p>
    </main>
  </body>
</html>`;
  const lazyBottomFlushFixtureHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lazy Bottom Flush Fixture</title>
    <style>
      body {
        margin: 0;
        font-family: sans-serif;
      }
      main {
        max-width: 680px;
        margin: 0 auto;
        padding: 32px 20px;
      }
      .spacer {
        height: 5200px;
      }
      p {
        line-height: 1.7;
      }
    </style>
  </head>
  <body>
    <main>
      <p id="visible">Visible text.</p>
      <div class="spacer"></div>
      <p id="below">Below the fold.</p>
    </main>
  </body>
</html>`;
  const waitingFixtureHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Waiting Widget Fixture</title>
    <style>
      body {
        margin: 0;
        font-family: sans-serif;
      }
      article {
        max-width: 680px;
        margin: 0 auto;
        padding: 32px 20px;
        line-height: 1.8;
      }
    </style>
  </head>
  <body>
    <article>
      <p id="waiting-paragraph">
        Representation theory helps describe symmetry with linear maps, and this fixture keeps enough
        surrounding prose to trigger the auto prompt without needing a full Wikipedia-sized page.
      </p>
    </article>
  </body>
</html>`;
  const giantInlineFixtureHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Giant Inline HTML Fixture</title>
    <style>
      body {
        margin: 0;
        font-family: sans-serif;
      }
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 32px 20px;
        line-height: 1.75;
      }
    </style>
  </head>
  <body>
    <main>
      <p id="small">Small visible block.</p>
      <p id="giant">
        ${Array.from(
          { length: 18 },
          (_, index) =>
            `<a href="/term-${index}">Term ${index + 1} with extended inline explanation for batching.</a> followed by supporting text.`,
        ).join(' ')}
      </p>
    </main>
  </body>
</html>`;
  const lengthRetryFixtureHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Length Retry Fixture</title>
    <style>
      body {
        margin: 0;
        font-family: sans-serif;
      }
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 32px 20px;
        line-height: 1.75;
      }
    </style>
  </head>
  <body>
    <main>
      <p id="p-1">Alpha paragraph about representations.</p>
      <p id="p-2">Beta paragraph about characters.</p>
      <p id="p-3">Gamma paragraph about modules.</p>
      <p id="p-4">Delta paragraph about decompositions.</p>
    </main>
  </body>
</html>`;

  const server = createServer((request, response) => {
    if (request.url === '/wikipedia-representation-theory.html') {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      response.end(fixtureHtml);
      return;
    }

    if (request.url === '/lazy-widget.html') {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      response.end(lazyFixtureHtml);
      return;
    }

    if (request.url === '/lazy-bottom-flush.html') {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      response.end(lazyBottomFlushFixtureHtml);
      return;
    }

    if (request.url === '/waiting-widget.html') {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      response.end(waitingFixtureHtml);
      return;
    }

    if (request.url === '/giant-inline-html.html') {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      response.end(giantInlineFixtureHtml);
      return;
    }

    if (request.url === '/length-retry.html') {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      response.end(lengthRetryFixtureHtml);
      return;
    }

    response.writeHead(404, {
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end('Not found');
  });

  await new Promise<void>((resolveStart) => {
    server.listen(0, '127.0.0.1', () => resolveStart());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start fixture server.');
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => closeServer(server),
  };
}

function closeServer(server: Server): Promise<void> {
  return new Promise<void>((resolveClose, rejectClose) => {
    server.close((error) => {
      if (error) {
        rejectClose(error);
        return;
      }
      resolveClose();
    });
  });
}
