from setuptools import setup, find_packages

setup(
    name="wasmify-sdk",
    version="1.0.0",
    description="Wasmify Python SDK - Run WebAssembly anywhere",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Wasmify Team",
    author_email="team@wasmify.com",
    url="https://wasmify.com",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Emulators",
        "Topic :: System :: Software Distribution",
    ],
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.25.0",
        "dataclasses>=0.6; python_version<'3.7'",
    ],
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-cov>=2.0",
            "black>=21.0",
            "flake8>=3.8",
            "mypy>=0.800",
        ],
        "wasmtime": [
            "wasmtime>=0.0.2",
        ],
    },
    entry_points={
        "console_scripts": [
            "wasmify=wasmify.cli:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)