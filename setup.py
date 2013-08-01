#!/usr/bin/env python
from distutils.core import setup
import pkg_resources
import sys

version = open('VERSION', 'r').read().strip()

requires = ['csv']

setup(name='organ',
      version=version,
      description='A tabular data organizer',
      classifiers=[
          'Development Status :: 3 - Alpha',
          'Environment :: Console',
          'License :: OSI Approved :: BSD License',
          'Natural Language :: English',
          'Operating System :: POSIX',
          'Programming Language :: Python',
          'Topic :: Scientific/Engineering :: Information Analysis',
          'Topic :: Software Development :: Libraries :: Python Modules',
          'Topic :: Text Processing :: Filters',
          'Topic :: Utilities'
      ],
      author='Shawn Allen',
      author_email='shawn@stamen.com',
      url='http://shawnbot.github.io/organ',
      requires=requires,
      packages=['organ'],
      scripts=['organize.py'],
      download_url='https://github.com/shawnbot/py-organ/archive/v%s.tar.gz' % version,
      license='BSD')
