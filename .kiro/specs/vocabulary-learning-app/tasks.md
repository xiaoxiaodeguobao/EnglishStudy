# Implementation Plan: Vocabulary Learning App

## Overview

本实现计划将单词学习Web应用分解为可执行的编码任务。应用采用React + TypeScript + Vite技术栈，使用Zustand进行状态管理，Dexie.js实现数据持久化，集成AI服务生成智能关联单词。

实现顺序遵循从底层到上层的原则：首先建立数据层和服务层基础，然后实现核心业务逻辑，最后构建UI组件并集成所有功能。

## Tasks

- [x] 1. 项目初始化和基础配置
  - 使用Vite创建React + TypeScript项目
  - 配置Tailwind CSS和必要的UI库
  - 设置ESLint、Prettier代码规范
  - 配置Vitest测试框架和fast-check属性测试库
  - 创建基础目录结构（components、services、stores、types、utils）
  - _Requirements: 11.1, 11.2_

- [ ]* 1.1 编写项目配置的单元测试
  - 验证Vite配置正确性
  - 验证TypeScript配置
  - _Requirements: 11.1_

- [x] 2. 定义核心数据类型和接口
  - 创建types目录并定义所有TypeScript接口
  - 定义LearningPlan、Word、WordDefinition、ExampleSentence等核心类型
  - 定义DailyWordList、WordAssociation、SentenceChain类型
  - 定义LearningProgress、DailyRecord类型
  - 定义服务层接口（LearningPlanService、WordGeneratorService等）
  - _Requirements: 1.1, 1.2, 3.1, 6.1, 7.1, 8.1_

- [x] 3. 实现数据持久化层（StorageService）
  - [x] 3.1 配置Dexie.js数据库
    - 创建VocabularyDB类，定义数据库schema
    - 配置learningPlans、dailyWordLists、words、learningProgress四个对象存储
    - 设置索引（date、planId、word、generatedAt等）
    - _Requirements: 10.1, 10.3_

  - [ ]* 3.2 编写数据持久化的属性测试
    - **Property 3: 数据持久化往返一致性**
    - **验证需求：Requirements 1.6, 10.1, 10.2, 10.3, 10.4, 10.5**

  - [x] 3.3 实现StorageService接口
    - 实现savePlan、loadPlan、loadCurrentPlan方法
    - 实现saveDailyWordList、loadDailyWordList、loadAllWordLists方法
    - 实现saveProgress、loadProgress方法
    - 实现searchWords、getWordsByDateRange方法
    - 添加错误处理和日志记录
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 9.2, 9.4_

  - [ ]* 3.4 编写StorageService的单元测试
    - 测试数据保存和读取
    - 测试搜索和筛选功能
    - 测试错误处理场景
    - _Requirements: 10.1, 10.2, 10.3, 12.4_

- [x] 4. 实现学习计划服务（LearningPlanService）
  - [x] 4.1 实现学习计划验证逻辑
    - 创建validateDaysCount函数（验证1-365范围）
    - 创建validateWordsPerDay函数（验证1-100范围）
    - _Requirements: 1.4, 1.5_

  - [ ]* 4.2 编写学习计划验证的属性测试
    - **Property 1: 学习天数范围验证**
    - **验证需求：Requirements 1.4**

  - [ ]* 4.3 编写每日单词数验证的属性测试
    - **Property 2: 每日单词数范围验证**
    - **验证需求：Requirements 1.5**

  - [x] 4.4 实现LearningPlanService接口
    - 实现createPlan方法（创建学习计划并保存）
    - 实现updatePlan方法（更新计划并保留已完成进度）
    - 实现getCurrentPlan方法（获取当前活动计划）
    - 实现deletePlan方法
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 2.1_

  - [ ]* 4.5 编写计划修改保留进度的属性测试
    - **Property 4: 修改计划保留已完成进度**
    - **验证需求：Requirements 2.2**

  - [ ]* 4.6 编写计划修改重新计算的属性测试
    - **Property 5: 计划修改后未来安排重新计算**
    - **验证需求：Requirements 2.3**

  - [ ]* 4.7 编写LearningPlanService的单元测试
    - 测试创建和更新计划的边界情况
    - 测试错误处理
    - _Requirements: 1.4, 1.5, 2.1, 2.2_

- [x] 5. Checkpoint - 确保数据层和计划服务测试通过
  - 确保所有测试通过，询问用户是否有问题

- [x] 6. 实现词典服务（DictionaryService）
  - [x] 6.1 创建DictionaryService接口实现
    - 实现getWordDefinitions方法（调用Free Dictionary API）
    - 实现getPhonetic方法（获取音标）
    - 实现searchWord方法
    - 添加API请求错误处理和重试逻辑
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 12.1_

  - [ ]* 6.2 编写词典数据完整性的属性测试
    - **Property 12: 词典数据完整性**
    - **验证需求：Requirements 6.1, 6.2, 6.3, 6.6**

  - [ ]* 6.3 编写多词性覆盖的属性测试
    - **Property 13: 多词性完整覆盖**
    - **验证需求：Requirements 6.4**

  - [ ]* 6.4 编写DictionaryService的单元测试
    - 测试API调用成功和失败场景
    - 测试数据解析
    - 测试错误消息展示
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 12.1_

- [x] 7. 实现例句服务（ExampleSentenceService）
  - [x] 7.1 创建ExampleSentenceService接口实现
    - 实现getExamples方法（集成AI服务生成例句）
    - 实现validateExamples方法（验证例句质量）
    - 确保例句包含中文翻译
    - 添加错误处理
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 12.2_

  - [ ]* 7.2 编写例句数量范围的属性测试
    - **Property 14: 例句数量范围**
    - **验证需求：Requirements 7.1**

  - [ ]* 7.3 编写例句词性覆盖的属性测试
    - **Property 15: 例句词性覆盖**
    - **验证需求：Requirements 7.2**

  - [ ]* 7.4 编写例句包含翻译的属性测试
    - **Property 16: 例句包含翻译**
    - **验证需求：Requirements 7.4**

  - [ ]* 7.5 编写ExampleSentenceService的单元测试
    - 测试例句生成和验证
    - 测试错误处理
    - _Requirements: 7.1, 7.2, 7.4, 12.2_

- [x] 8. 实现单词生成服务（WordGeneratorService）
  - [x] 8.1 实现单词关联性验证逻辑
    - 创建calculateAssociationRate函数
    - 创建hasAssociation函数（检查主题、语义、词根、场景关联）
    - _Requirements: 4.1, 4.2_

  - [ ]* 8.2 编写单词关联度阈值的属性测试
    - **Property 10: 单词关联度阈值**
    - **验证需求：Requirements 4.1**

  - [x] 8.3 实现AI单词生成逻辑
    - 创建generateDailyWords方法（调用OpenAI/Claude API）
    - 构建AI提示词（包含单词数量、关联性要求、已使用单词列表）
    - 解析AI返回的JSON数据
    - 验证生成的单词满足关联性要求（≥80%）
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 4.1, 4.3_

  - [ ]* 8.4 编写每日单词列表数量匹配的属性测试
    - **Property 6: 每日单词列表数量匹配**
    - **验证需求：Requirements 3.2**

  - [ ]* 8.5 编写单词列表包含关联信息的属性测试
    - **Property 7: 单词列表包含关联信息**
    - **验证需求：Requirements 3.3, 4.3**

  - [x] 8.6 实现单词唯一性检查
    - 创建getUsedWords方法（获取历史已使用单词）
    - 在生成时排除已使用单词
    - _Requirements: 3.5_

  - [ ]* 8.7 编写单词唯一性的属性测试
    - **Property 9: 单词唯一性**
    - **验证需求：Requirements 3.5**

  - [x] 8.8 实现句子链生成逻辑
    - 创建generateSentenceChains方法
    - 调用AI服务生成使用多个单词的连锁句子
    - 验证句子链至少包含3个示例
    - _Requirements: 3.4, 5.1, 5.2_

  - [ ]* 8.9 编写句子链构造的属性测试
    - **Property 8: 单词列表支持句子链构造**
    - **验证需求：Requirements 3.4, 5.1**

  - [ ]* 8.10 编写句子链数量要求的属性测试
    - **Property 11: 句子链数量要求**
    - **验证需求：Requirements 5.2**

  - [ ]* 8.11 编写WordGeneratorService的单元测试
    - 测试AI调用失败的错误处理
    - 测试关联性验证边界情况
    - 测试单词唯一性检查
    - _Requirements: 3.5, 4.1, 12.3_

- [x] 9. Checkpoint - 确保所有服务层测试通过
  - 确保所有测试通过，询问用户是否有问题

- [x] 10. 实现进度跟踪服务（ProgressService）
  - [x] 10.1 实现ProgressService接口
    - 实现getProgress方法（计算学习统计数据）
    - 实现markDayComplete方法（标记某天完成）
    - 实现getDailyRecord方法
    - 计算总单词数、完成百分比、剩余天数
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 10.2 编写进度统计计算正确性的属性测试
    - **Property 17: 进度统计计算正确性**
    - **验证需求：Requirements 8.2, 8.3, 8.4**

  - [ ]* 10.3 编写完成任务更新进度的属性测试
    - **Property 18: 完成任务更新进度**
    - **验证需求：Requirements 8.5**

  - [ ]* 10.4 编写ProgressService的单元测试
    - 测试进度计算边界情况
    - 测试完成标记功能
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. 实现状态管理（Zustand Stores）
  - [x] 11.1 创建learningPlanStore
    - 管理当前学习计划状态
    - 提供createPlan、updatePlan、loadCurrentPlan actions
    - _Requirements: 1.1, 1.7, 2.1_

  - [x] 11.2 创建dailyWordsStore
    - 管理当前日期的单词列表
    - 提供loadDailyWords、generateNewWords actions
    - _Requirements: 3.1, 3.2_

  - [x] 11.3 创建progressStore
    - 管理学习进度状态
    - 提供loadProgress、markComplete actions
    - _Requirements: 8.1, 8.5_

  - [ ]* 11.4 编写状态管理的单元测试
    - 测试状态更新逻辑
    - 测试actions调用
    - _Requirements: 1.1, 3.1, 8.1_

- [x] 12. 实现错误处理和日志系统
  - [x] 12.1 创建ErrorLog类型和存储
    - 定义ErrorLog接口
    - 在IndexedDB中添加errorLogs对象存储
    - _Requirements: 12.5_

  - [x] 12.2 实现错误日志记录函数
    - 创建logger工具（记录不同级别的错误）
    - 实现错误日志存储和查询
    - _Requirements: 12.5_

  - [ ]* 12.3 编写错误日志记录的属性测试
    - **Property 22: 错误日志记录**
    - **验证需求：Requirements 12.5**

  - [x] 12.3 在所有服务中集成错误处理
    - 在DictionaryService中添加错误捕获和日志
    - 在ExampleSentenceService中添加错误捕获和日志
    - 在WordGeneratorService中添加错误捕获和日志
    - 在StorageService中添加错误捕获和日志
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 13. Checkpoint - 确保业务逻辑层完整
  - 确保所有测试通过，询问用户是否有问题

- [x] 14. 实现基础UI组件
  - [x] 14.1 创建Layout和Header组件
    - 实现应用布局容器
    - 实现导航栏（包含页面链接）
    - 使用Tailwind CSS实现响应式设计
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 14.2 创建表单验证组件
    - 创建FormInput组件（带验证提示）
    - 创建FormError组件（显示错误消息）
    - _Requirements: 1.4, 1.5_

  - [x] 14.3 创建ErrorMessage组件
    - 显示友好的错误提示
    - 提供重试按钮
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 14.4 编写基础UI组件的单元测试
    - 测试Layout渲染
    - 测试表单验证显示
    - 测试错误消息显示
    - _Requirements: 11.1, 12.1_

- [x] 15. 实现学习计划页面（PlanSetupPage）
  - [x] 15.1 创建PlanSetupPage组件
    - 实现学习计划创建表单
    - 集成表单验证（学习天数1-365，每日单词数1-100）
    - 连接learningPlanStore
    - 实现创建和更新计划功能
    - 显示当前计划信息
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1_

  - [ ]* 15.2 编写PlanSetupPage的单元测试
    - 测试表单渲染
    - 测试验证错误显示
    - 测试计划创建和更新
    - _Requirements: 1.1, 1.4, 1.5, 2.1_

- [x] 16. 实现单词展示组件
  - [x] 16.1 创建WordDefinition组件
    - 显示词性、中英文释义
    - 使用结构化格式展示
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 16.2 创建ExampleSentences组件
    - 显示例句列表
    - 高亮显示目标单词
    - 显示中文翻译
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 16.3 创建WordCard组件
    - 整合WordDefinition和ExampleSentences
    - 显示单词、音标
    - 实现响应式布局
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 7.1, 7.4, 11.3_

  - [x] 16.4 创建WordList组件
    - 显示单词列表
    - 使用虚拟滚动优化性能（如果单词数量多）
    - _Requirements: 3.2, 11.3_

  - [ ]* 16.5 编写单词展示组件的单元测试
    - 测试WordCard渲染
    - 测试例句高亮显示
    - 测试响应式布局
    - _Requirements: 6.5, 7.3, 11.3_

- [x] 17. 实现每日学习页面（DailyLearningPage）
  - [x] 17.1 创建SentenceChainSection组件
    - 显示句子链列表
    - 高亮显示使用的单词
    - 显示中文翻译
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 17.2 创建WordAssociationDisplay组件
    - 显示单词之间的关联关系
    - 可视化关联类型（主题、语义、词根、场景）
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 17.3 创建DailyLearningPage组件
    - 显示当前日期
    - 集成WordList组件显示每日单词
    - 集成SentenceChainSection显示句子链
    - 集成WordAssociationDisplay显示关联关系
    - 连接dailyWordsStore
    - 实现加载和生成每日单词功能
    - 添加"完成学习"按钮（标记当天完成）
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.4, 5.1, 5.2, 5.3, 8.5_

  - [ ]* 17.4 编写DailyLearningPage的单元测试
    - 测试页面渲染
    - 测试单词加载
    - 测试完成标记功能
    - _Requirements: 3.1, 5.1, 8.5_

- [x] 18. 实现进度页面（ProgressPage）
  - [x] 18.1 创建ProgressPage组件
    - 显示学习统计数据（总单词数、完成百分比、剩余天数）
    - 显示每日学习记录
    - 连接progressStore
    - 实现进度可视化（进度条或图表）
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 18.2 编写ProgressPage的单元测试
    - 测试统计数据显示
    - 测试进度可视化
    - _Requirements: 8.2, 8.3, 8.4_

- [x] 19. 实现复习页面（ReviewPage）
  - [x] 19.1 创建ReviewPage组件
    - 实现日期范围筛选器
    - 实现搜索功能
    - 显示历史单词列表（使用WordList组件）
    - 连接StorageService的searchWords和getWordsByDateRange方法
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 19.2 编写日期筛选正确性的属性测试
    - **Property 19: 日期筛选正确性**
    - **验证需求：Requirements 9.2**

  - [ ]* 19.3 编写历史单词数据完整性的属性测试
    - **Property 20: 历史单词数据完整性**
    - **验证需求：Requirements 9.3**

  - [ ]* 19.4 编写搜索结果相关性的属性测试
    - **Property 21: 搜索结果相关性**
    - **验证需求：Requirements 9.4**

  - [ ]* 19.5 编写ReviewPage的单元测试
    - 测试筛选和搜索功能
    - 测试历史单词显示
    - _Requirements: 9.1, 9.2, 9.4_

- [x] 20. Checkpoint - 确保所有UI组件测试通过
  - 确保所有测试通过，询问用户是否有问题

- [x] 21. 实现路由和应用入口
  - [x] 21.1 配置React Router
    - 设置路由配置（/、/daily、/review、/progress）
    - 实现路由导航
    - _Requirements: 11.1, 11.2_

  - [x] 21.2 创建App根组件
    - 集成Layout和路由
    - 实现应用初始化逻辑（加载当前计划、检查存储可用性）
    - 添加全局错误边界
    - _Requirements: 10.4, 11.1_

  - [ ]* 21.3 编写App组件的单元测试
    - 测试路由导航
    - 测试初始化逻辑
    - _Requirements: 10.4, 11.1_

- [x] 22. 集成外部API服务
  - [x] 22.1 配置环境变量
    - 创建.env文件模板
    - 配置API密钥（OpenAI/Claude、Dictionary API）
    - _Requirements: 6.1, 7.1_

  - [x] 22.2 实现API客户端
    - 创建HTTP客户端工具（使用fetch或axios）
    - 实现请求重试逻辑
    - 实现请求超时处理
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 22.3 编写API集成测试
    - 使用MSW模拟API响应
    - 测试成功和失败场景
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 23. 性能优化
  - [x] 23.1 实现代码分割
    - 配置路由级别的懒加载
    - 优化bundle大小
    - _Requirements: 11.1, 11.2_

  - [x] 23.2 实现数据缓存
    - 使用React Query缓存API请求
    - 配置缓存策略
    - _Requirements: 10.4_

  - [x] 23.3 优化列表渲染
    - 在WordList中实现虚拟滚动（如果需要）
    - 优化大列表性能
    - _Requirements: 11.3_

- [ ] 24. 端到端测试
  - [ ]* 24.1 编写完整用户流程的集成测试
    - 测试创建计划 → 生成单词 → 学习 → 查看进度流程
    - 测试复习功能
    - 测试计划修改功能
    - _Requirements: 1.1, 3.1, 8.5, 9.1_

- [x] 25. 构建和部署配置
  - [x] 25.1 配置生产构建
    - 优化Vite构建配置
    - 配置代码压缩和tree-shaking
    - 生成source maps
    - _Requirements: 11.1, 11.2_

  - [x] 25.2 创建部署文档
    - 编写README.md（包含项目说明、安装步骤、运行指南）
    - 创建.env.example文件
    - 编写部署指南（Vercel/Netlify）
    - _Requirements: 11.1_

- [x] 26. Final Checkpoint - 完整功能验证
  - 运行所有测试套件（单元测试、属性测试、集成测试）
  - 验证所有功能需求已实现
  - 检查代码质量（ESLint、Prettier）
  - 确保所有测试通过，询问用户是否有问题

## Notes

- 任务标记 `*` 的为可选测试任务，可以跳过以加快MVP开发
- 每个任务都引用了具体的需求编号，确保可追溯性
- Checkpoint任务确保增量验证，及时发现问题
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
- 所有属性测试必须运行至少100次迭代
- 实现顺序：数据层 → 服务层 → 状态管理 → UI组件 → 集成 → 优化
