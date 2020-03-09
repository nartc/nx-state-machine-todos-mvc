module.exports = {
  name: 'todos',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/todos',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
