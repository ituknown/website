import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import Giscus from '@giscus/react';

import type { Props } from '@theme/BlogLayout';

export default function BlogLayout(props: Props): ReactNode {
  const { sidebar, toc, children, ...layoutProps } = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          <BlogSidebar sidebar={sidebar} />
          <main
            className={clsx('col', {
              'col--7': hasSidebar,
              'col--9 col--offset-1': !hasSidebar,
            })}>
            {children}
            <br />
            <br />
            <Giscus
              id="comments"
              repo="ituknown/website"
              repoId="R_kgDOQd0tew"
              category="General"
              categoryId="DIC_kwDOQd0te84Cza27"
              mapping="pathname"
              strict="0"
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="top"
              lang="zh-CN"
              loading="lazy"
            />
          </main>
          {toc && <div className="col col--2">{toc}</div>}
        </div>
        <br />
      </div>
    </Layout>
  );
}
