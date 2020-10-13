/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import {DataDrawable, Drawable} from './drawable';
import {LayoutOption, RectLayout} from './layout';
import {DataSeries, Dimension, Rect} from './types';

export class RootLayout extends RectLayout {
  constructor(config: LayoutOption, contentGrid: RectLayout[][], rect: Rect) {
    super(config, contentGrid);
  }

  onResize(dim: Dimension) {
    this.internalOnlySetLayout({
      x: 0,
      y: 0,
      ...dim,
    });
    this.relayout();
  }

  async redraw() {
    for (const content of this.getAllDescendents()) {
      if (content instanceof DataDrawable) {
        content.internalOnlyTransformCoordinatesIfStale();
      }
    }

    for (const content of this.getAllDescendents()) {
      if (content instanceof Drawable) {
        content.internalOnlyRedraw();
      }
    }
  }

  markAsPaintDirty() {
    for (const content of this.getAllDescendents()) {
      if (content instanceof Drawable) {
        content.markAsPaintDirty();
      }
    }
  }

  setData(data: DataSeries[]) {
    for (const content of this.getAllDescendents()) {
      if (content instanceof DataDrawable) {
        return content.setData(data);
      }
    }
  }

  private *getAllDescendents(): Generator<RectLayout> {
    const contents = [...this.children()];

    while (contents.length) {
      const content = contents.shift()!;
      contents.push(...content.children());
      yield content;
    }
  }

  findChildByClass<T extends RectLayout>(
    klass: new (...params: any[]) => T
  ): T | null {
    for (const child of this.getAllDescendents()) {
      if (child instanceof klass) {
        return child;
      }
    }

    return null;
  }
}
