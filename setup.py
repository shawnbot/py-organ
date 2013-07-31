#!/usr/bin/env python
from distutils.core import setup
import pkg_resources
import sys

version = open('VERSION', 'r').read().strip()

requires = ['csv']

setup(name='organ',
      version=version,
      description='A tabular data organizer',
      author='Shawn Allen',
      author_email='shawn@stamen.com',
      url='http://shawnbot.github.io/organ',
      install_requires=requires,
      packages=['organ'],
      scripts=['bin/organize.py'],
      download_url='https://github.com/shawnbot/py-organ/archive/v%s.tar.gz' % version,
      license='BSD')
