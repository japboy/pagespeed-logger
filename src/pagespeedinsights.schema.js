/**
 * PageSpeed Insights API レスポンス JSON のスキーマ
 */

class SPEED {}
SPEED.schema = {
  name: 'SPEED',
  properties: {
    score: 'int'
  }
}

class RuleGroups {}
RuleGroups.schema = {
  name: 'RuleGroups',
  properties: {
    SPEED: 'SPEED',
  }
}

class PageStats {}
PageStats.schema = {
  name: 'PageStats',
  properties: {
    numberResources: 'int',
    numberHosts: 'int',
    totalRequestBytes: 'string',
    numberStaticResources: 'int',
    htmlResponseBytes: 'string',
    cssResponseBytes: 'string',
    imageResponseBytes: 'string',
    javascriptResponseBytes: 'string',
    otherResponseBytes: 'string',
    numberJsResources: 'int',
    numberCssResources: 'int',
  }
}


class Args {}
Args.schema = {
  name: 'Args',
  properties: {
    type: 'string',
    key: 'string',
    value: 'string',
  }
}

class Format {}
Format.schema = {
  name: 'Format',
  properties: {
    format: 'string',
    args: {
      type: 'list',
      objectType: 'Args',
    }
  }
}

class Result {}
Result.schema = {
  name: 'Result',
  properties: {
    result: 'Format',
  }
}

class UrlBlocks {}
UrlBlocks.schema = {
  name: 'UrlBlocks',
  properties: {
    header: 'Format',
    urls: {
      type: 'list',
      objectType: 'Result'
    },
  }
}

class RuleResult {}
RuleResult.schema = {
  name: 'RuleResult',
  properties: {
    localizedRuleName: 'string',
    ruleImpact: 'double',
    /*groups: {
      type: 'list',
      objectType: 'Group',
    },*/
    summary: 'Format',
    urlBlocks: {
      type: 'list',
      objectType: 'UrlBlocks',
    }
  }
}

class RuleResults {}
RuleResults.schema = {
  name: 'RuleResults',
  properties: {
    AvoidLandingPageRedirects: 'RuleResult',
    EnableGzipCompression: 'RuleResult',
    LeverageBrowserCaching: 'RuleResult',
    MainResourceServerResponseTime: 'RuleResult',
    MinifyCss: 'RuleResult',
    MinifyHTML: 'RuleResult',
    MinifyJavaScript: 'RuleResult',
    MinimizeRenderBlockingResources: 'RuleResult',
    OptimizeImages: 'RuleResult',
    PrioritizeVisibleContent: 'RuleResult',
  }
}

class FormattedResults {}
FormattedResults.schema = {
  name: 'FormattedResults',
  properties: {
    locale: 'string',
    ruleResults: {
      type: 'RuleResults'
    }
  }
}

class Version {}
Version.schema = {
  name: 'Version',
  properties: {
    major: 'int',
    minor: 'int',
  }
}

class PageRect {}
PageRect.schema = {
  name: 'PageRect',
  properties: {
    left: 'int',
    top: 'int',
    width: 'int',
    height: 'int',
  }
}

class Screenshot {}
Screenshot.schema = {
  name: 'Screenshot',
  properties: {
    mime_type: 'string',
    data: 'string',
    width: 'int',
    height: 'int',
    page_rect: 'PageRect',
  }
}

class PageSpeedInsights {}
PageSpeedInsights.schema = {
  name: 'PageSpeedInsights',
  properties: {
    datetime: 'string',
    name: 'string',
    kind: 'string',
    id: 'string',
    responseCode: 'int',
    title: 'string',
    ruleGroups: 'RuleGroups',
    pageStats: 'PageStats',
    formattedResults: 'FormattedResults',
    version: 'Version',
    screenshot: 'Screenshot',
  }
}

const schemas = [
  SPEED,
  RuleGroups,
  PageStats,
  Args,
  Format,
  Result,
  UrlBlocks,
  RuleResult,
  RuleResults,
  FormattedResults,
  Version,
  PageRect,
  Screenshot,
  PageSpeedInsights,
]

export default schemas
